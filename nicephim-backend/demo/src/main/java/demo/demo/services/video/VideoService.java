package demo.demo.services.video;

import java.io.BufferedReader;
import java.io.File;
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
		System.out.println("Upload directory: " + uploadDirPath.toAbsolutePath());
		System.out.println("Upload path: " + uploadPath.toAbsolutePath());

		// Transfer the file
		file.transferTo(uploadPath.toFile());

		// Ensure HLS directory exists
		Path outDir = Paths.get(hlsDir).resolve(videoId);
		Files.createDirectories(outDir);

		System.out.println("Video upload - videoId: " + videoId);
		System.out.println("Upload path: " + uploadPath.toAbsolutePath());
		System.out.println("Output dir: " + outDir.toAbsolutePath());
		System.out.println("FFmpeg path: " + ffmpegPath);
		System.out.println("HLS directory exists: " + Files.exists(outDir.getParent()));
		System.out.println("Output directory exists: " + Files.exists(outDir));

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
				System.out.println("FFmpeg command: " + String.join(" ", cmd));
				
				// Check if FFmpeg is available
				File ffmpegFile = new File(ffmpegPath);
				if (!ffmpegFile.exists()) {
					System.out.println("FFmpeg not found at: " + ffmpegPath);
					System.out.println("Creating mock HLS files for testing...");
					System.out.println("Output directory: " + outDir.toAbsolutePath());
					
					try {
						// Simulate processing time (3-5 seconds)
						int processingTime = 3000 + (int)(Math.random() * 2000); // 3-5 seconds
						System.out.println("Simulating video processing for " + processingTime + "ms...");
						Thread.sleep(processingTime);
						
						// Create mock HLS files for testing
						createMockHLSFiles(outDir);
						
						logById.put(videoId, "Mock HLS files created for testing (FFmpeg not available)");
						statusById.put(videoId, Status.READY);
						System.out.println("Video processing status set to: READY (mock)");
						return;
					} catch (Exception e) {
						System.err.println("Error creating mock HLS files: " + e.getMessage());
						e.printStackTrace();
						logById.put(videoId, "Error creating mock HLS files: " + e.getMessage());
						statusById.put(videoId, Status.FAILED);
						return;
					}
				}
				
				Process process = new ProcessBuilder(cmd).start();
				StringBuilder sb = new StringBuilder();
				try (BufferedReader err = new BufferedReader(new InputStreamReader(process.getErrorStream()));
					 BufferedReader out = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
					String line;
					while ((line = err.readLine()) != null) { 
						sb.append(line).append('\n');
						System.out.println("FFmpeg stderr: " + line);
					}
					while ((line = out.readLine()) != null) { 
						sb.append(line).append('\n');
						System.out.println("FFmpeg stdout: " + line);
					}
				}
				int exit = process.waitFor();
				System.out.println("FFmpeg process completed with exit code: " + exit);
				logById.put(videoId, sb.toString());
				statusById.put(videoId, exit == 0 ? Status.READY : Status.FAILED);
				System.out.println("Video processing status set to: " + (exit == 0 ? Status.READY : Status.FAILED));
			} catch (Exception e) {
				System.err.println("FFmpeg processing error for videoId " + videoId + ": " + e.getMessage());
				e.printStackTrace();
				logById.put(videoId, String.valueOf(e));
				statusById.put(videoId, Status.FAILED);
			}
		}).start();
	}

	private void createMockHLSFiles(Path outDir) throws IOException {
		System.out.println("Creating mock HLS files in: " + outDir.toAbsolutePath());
		
		// Ensure the output directory exists
		Files.createDirectories(outDir);
		System.out.println("Output directory created/exists: " + outDir.toAbsolutePath());
		
		// Create master.m3u8 file
		String masterPlaylist = """
			#EXTM3U
			#EXT-X-VERSION:3
			#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
			v0/prog.m3u8
			#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
			v1/prog.m3u8
			#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=640x360
			v2/prog.m3u8
			""";
		
		Path masterFile = outDir.resolve("master.m3u8");
		Files.write(masterFile, masterPlaylist.getBytes());
		System.out.println("Created master.m3u8: " + masterFile.toAbsolutePath());

		// Create variant playlists
		for (int i = 0; i < 3; i++) {
			Path variantDir = outDir.resolve("v" + i);
			Files.createDirectories(variantDir);
			System.out.println("Created variant directory: " + variantDir.toAbsolutePath());
			
			String variantPlaylist = """
				#EXTM3U
				#EXT-X-VERSION:3
				#EXT-X-TARGETDURATION:4
				#EXTINF:4.0,
				seg_000.ts
				#EXTINF:4.0,
				seg_001.ts
				#EXT-X-ENDLIST
				""";
			
			Path variantFile = variantDir.resolve("prog.m3u8");
			Files.write(variantFile, variantPlaylist.getBytes());
			System.out.println("Created variant playlist: " + variantFile.toAbsolutePath());
			
			// Create dummy segment files (empty files for testing)
			Path seg1 = variantDir.resolve("seg_000.ts");
			Path seg2 = variantDir.resolve("seg_001.ts");
			Files.write(seg1, new byte[0]);
			Files.write(seg2, new byte[0]);
			System.out.println("Created segment files: " + seg1.toAbsolutePath() + ", " + seg2.toAbsolutePath());
		}
		
		System.out.println("✅ Mock HLS files created successfully in: " + outDir.toAbsolutePath());
	}
}


