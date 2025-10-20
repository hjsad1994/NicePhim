package demo.demo.services.video;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class VideoService {

	@Value("${media.upload.dir}")
	private String uploadDir;

	@Value("${media.hls.dir}")
	private String hlsDir;

	@Value("${media.ffmpeg.path}")
	private String ffmpegPath;

	public enum Status { PROCESSING, READY, FAILED }

	private final Map<String, Status> statusById = new ConcurrentHashMap<>();
	private final Map<String, String> logById = new ConcurrentHashMap<>();

	public record UploadResult(String videoId, String hlsUrl, Status status) {}

	public UploadResult handleUpload(MultipartFile file) throws IOException {
		String videoId = UUID.randomUUID().toString();

		// Ensure upload directory exists
		Path uploadDirPath = Paths.get(uploadDir);
		Files.createDirectories(uploadDirPath);

		// Create the upload path
		Path uploadPath = uploadDirPath.resolve(videoId + ".mp4");

		System.out.println("Video upload - videoId: " + videoId);
		System.out.println("Upload path: " + uploadPath.toAbsolutePath());

		// Transfer the file
		file.transferTo(uploadPath.toFile());

		// Ensure HLS directory exists
		Path outDir = Paths.get(hlsDir).resolve(videoId);
		Files.createDirectories(outDir);

		statusById.put(videoId, Status.PROCESSING);
		spawnFfmpegPipeline(uploadPath, outDir, videoId);

		return new UploadResult(videoId, "/videos/" + videoId + "/master.m3u8", Status.PROCESSING);
	}

	public UploadResult ingestExisting(String filename) throws IOException {
		Path source = Paths.get(uploadDir).resolve(filename);
		if (!Files.exists(source)) {
			throw new IOException("File not found: " + source);
		}
		String videoId = UUID.randomUUID().toString();
		Path outDir = Paths.get(hlsDir).resolve(videoId);
		Files.createDirectories(outDir);

		statusById.put(videoId, Status.PROCESSING);
		spawnFfmpegPipeline(source, outDir, videoId);

		return new UploadResult(videoId, "/videos/" + videoId + "/master.m3u8", Status.PROCESSING);
	}

	public Status getStatus(String videoId) {
		return statusById.getOrDefault(videoId, null);
	}

	public String getLastLog(String videoId) {
		return logById.get(videoId);
	}

	private void spawnFfmpegPipeline(Path inputMp4, Path outDir, String videoId) throws IOException {
		// Ensure variant directories exist to avoid segment filename errors on Windows
		Files.createDirectories(outDir.resolve("v0"));
		Files.createDirectories(outDir.resolve("v1"));
		Files.createDirectories(outDir.resolve("v2"));
		List<String> cmd = List.of(
			ffmpegPath, "-y", "-i", inputMp4.toString(),
			"-filter_complex",
			"[0:v]split=3[v1080][v720][v360];[v1080]scale=w=-2:h=1080[v1080out];[v720]scale=w=-2:h=720[v720out];[v360]scale=w=-2:h=360[v360out]",
			// Map variant 0 (1080p)
			"-map", "[v1080out]", "-map", "0:a:0",
			"-c:v:0", "libx264", "-b:v:0", "5000k", "-preset:v:0", "veryfast",
			"-c:a:0", "aac", "-b:a:0", "128k",
			// Map variant 1 (720p)
			"-map", "[v720out]", "-map", "0:a:0",
			"-c:v:1", "libx264", "-b:v:1", "3000k", "-preset:v:1", "veryfast",
			"-c:a:1", "aac", "-b:a:1", "128k",
			// Map variant 2 (360p)
			"-map", "[v360out]", "-map", "0:a:0",
			"-c:v:2", "libx264", "-b:v:2", "1000k", "-preset:v:2", "veryfast",
			"-c:a:2", "aac", "-b:a:2", "96k",
			// HLS settings
			"-f", "hls", "-hls_time", "4", "-hls_playlist_type", "vod",
			"-hls_list_size", "0", "-hls_flags", "independent_segments+temp_file",
			"-hls_segment_filename", outDir.resolve("v%v/seg_%03d.ts").toString(),
			"-master_pl_name", "master.m3u8",
			"-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2",
			outDir.resolve("v%v/prog.m3u8").toString()
		);

		new Thread(() -> {
			try {
				System.out.println("Starting FFmpeg process for videoId: " + videoId);
				
				Process process = new ProcessBuilder(cmd).start();
				StringBuilder sb = new StringBuilder();
				try (BufferedReader err = new BufferedReader(new InputStreamReader(process.getErrorStream()));
					 BufferedReader out = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
					String line;
					while ((line = err.readLine()) != null) { 
						sb.append(line).append('\n');
					}
					while ((line = out.readLine()) != null) { 
						sb.append(line).append('\n');
					}
				}
				int exit = process.waitFor();
				System.out.println("FFmpeg process completed with exit code: " + exit);
				logById.put(videoId, sb.toString());
				statusById.put(videoId, exit == 0 ? Status.READY : Status.FAILED);
			} catch (Exception e) {
				System.err.println("FFmpeg processing error for videoId " + videoId + ": " + e.getMessage());
				e.printStackTrace();
				logById.put(videoId, String.valueOf(e));
				statusById.put(videoId, Status.FAILED);
			}
		}).start();
	}
}


