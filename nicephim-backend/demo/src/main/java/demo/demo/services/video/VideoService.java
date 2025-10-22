package demo.demo.services.video;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Dịch vụ upload video và chuyển đổi HLS với các chất lượng thích ứng.
 * Hỗ trợ 4K/2K/1080p/720p/360p dựa trên độ phân giải đầu vào (không phóng to).
 */
@Service
public class VideoService {

	// Thư mục lưu file video gốc
	@Value("${media.upload.dir}")
	private String uploadDir;

	// Thư mục đầu ra HLS (master.m3u8 + các biến thể)
	@Value("${media.hls.dir}")
	private String hlsDir;

	// Đường dẫn chương trình FFmpeg
	@Value("${media.ffmpeg.path}")
	private String ffmpegPath;

	// Trạng thái mã hóa: PROCESSING, READY, FAILED
	public enum Status { PROCESSING, READY, FAILED }

	// Theo dõi trạng thái: videoId -> Status
	private final Map<String, Status> statusById = new ConcurrentHashMap<>();

	// Log FFmpeg: videoId -> toàn bộ stderr
	private final Map<String, String> logById = new ConcurrentHashMap<>();

	// Theo dõi tiến trình: videoId -> phần trăm (0-100)
	private final Map<String, Double> progressById = new ConcurrentHashMap<>();

	// Kết quả upload: videoId, HLS URL, status
	public record UploadResult(String videoId, String hlsUrl, Status status) {}

	// Upload video, lưu vào đĩa, bắt đầu chuyển đổi nền (không chặn)
	public UploadResult handleUpload(MultipartFile file) throws IOException {
		String videoId = UUID.randomUUID().toString();
		Path uploadDirPath = Paths.get(uploadDir);
		Files.createDirectories(uploadDirPath);

		// Giữ nguyên phần mở rộng file gốc (.mp4, .ts, .mkv, v.v.)
		String originalFilename = file.getOriginalFilename();
		String extension = ".mp4";
		if (originalFilename != null && originalFilename.contains(".")) {
			extension = originalFilename.substring(originalFilename.lastIndexOf("."));
		}
		
		Path uploadPath = uploadDirPath.resolve(videoId + extension);


		file.transferTo(uploadPath.toFile());

		Path outDir = Paths.get(hlsDir).resolve(videoId);
		Files.createDirectories(outDir);

		statusById.put(videoId, Status.PROCESSING);
		spawnFfmpegPipeline(uploadPath, outDir, videoId);
		return new UploadResult(videoId, "/videos/" + videoId + "/master.m3u8", Status.PROCESSING);
	}

	// Chuyển đổi file có sẵn trong uploadDir (cho migration/mã hóa lại)
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

	// Lấy trạng thái mã hóa: PROCESSING/READY/FAILED
	public Status getStatus(String videoId) {
		return statusById.getOrDefault(videoId, null);
	}

	// Lấy log FFmpeg để debug
	public String getLastLog(String videoId) {
		return logById.get(videoId);
	}

	// Lấy phần trăm tiến trình (0-100)
	public Double getProgress(String videoId) {
		return progressById.get(videoId);
	}

	// Pipeline chuyển đổi chính: phát hiện độ phân giải, xây dựng lệnh FFmpeg, tạo luồng nền
	private void spawnFfmpegPipeline(Path inputMp4, Path outDir, String videoId) throws IOException {
		int inputHeight = getInputHeight(inputMp4);
		double duration = getVideoDuration(inputMp4);
		
		// Tạo thư mục biến thể v0-v4
		for (int i = 0; i < 5; i++) {
			Files.createDirectories(outDir.resolve("v" + i));
		}
		
		List<String> cmd = buildFfmpegCommand(inputMp4, outDir, inputHeight);
		
		// Tạo luồng nền (không chặn)
		new Thread(() -> {
			try {
				Process process = new ProcessBuilder(cmd).start();
				StringBuilder sb = new StringBuilder();
				// Đọc stderr FFmpeg và phân tích tiến trình
				try (BufferedReader err = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
					String line;
					long lastProgressTime = System.currentTimeMillis();
					
					while ((line = err.readLine()) != null) {
						sb.append(line).append('\n');
						
						// Cập nhật tiến trình mỗi 2 giây
						if (line.contains("time=") && line.contains("speed=")) {
							long now = System.currentTimeMillis();
							if (now - lastProgressTime >= 2000) {
								double progress = parseProgress(line, duration);
								if (progress >= 0) {
									progressById.put(videoId, progress);
								}
								lastProgressTime = now;
							}
						}
					}
				}
				
				int exit = process.waitFor();
				logById.put(videoId, sb.toString());
				statusById.put(videoId, exit == 0 ? Status.READY : Status.FAILED);
				
				if (exit == 0) {
					progressById.put(videoId, 100.0);
				} else {
					progressById.remove(videoId);
				}
				
			} catch (Exception e) {
				logById.put(videoId, String.valueOf(e));
				statusById.put(videoId, Status.FAILED);
			}
		}).start();
	}

	// Phát hiện chiều cao video bằng ffprobe (trả về 2160, 1440, 1080, 720, 360, v.v.)
	private int getInputHeight(Path inputMp4) {
		try {
			List<String> probeCmd = List.of(
				"ffprobe", "-v", "error",
				"-select_streams", "v:0",
				"-show_entries", "stream=height",
				"-of", "default=noprint_wrappers=1:nokey=1",
				inputMp4.toString()
			);
			
			Process process = new ProcessBuilder(probeCmd).start();
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			String heightStr = reader.readLine();
			process.waitFor();
			
			if (heightStr != null && !heightStr.isEmpty()) {
				return Integer.parseInt(heightStr.trim());
			}
		} catch (Exception e) {
			// Bỏ qua
		}
		return 1080; // Mặc định
	}

	// Lấy thời lượng video (giây) bằng ffprobe
	private double getVideoDuration(Path inputMp4) {
		try {
			List<String> probeCmd = List.of(
				"ffprobe", "-v", "error",
				"-select_streams", "v:0",
				"-show_entries", "format=duration",
				"-of", "default=noprint_wrappers=1:nokey=1",
				inputMp4.toString()
			);
			
			Process process = new ProcessBuilder(probeCmd).start();
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			String durationStr = reader.readLine();
			process.waitFor();
			
			if (durationStr != null && !durationStr.isEmpty()) {
				return Double.parseDouble(durationStr.trim());
			}
		} catch (Exception e) {
			// Bỏ qua
		}
		return 0;
	}

	// Phân tích tiến trình từ output FFmpeg: time=HH:MM:SS.ms -> phần trăm
	private double parseProgress(String line, double duration) {
		try {
			int timeIdx = line.indexOf("time=");
			if (timeIdx == -1 || duration <= 0) return -1;
			
			String timeStr = line.substring(timeIdx + 5).split("\\s+")[0];
			if (timeStr.contains(":")) {
				String[] parts = timeStr.split(":");
				double hours = Double.parseDouble(parts[0]);
				double minutes = Double.parseDouble(parts[1]);
				double seconds = Double.parseDouble(parts[2]);
				double currentTime = hours * 3600 + minutes * 60 + seconds;
				return (currentTime / duration) * 100.0;
			}
		} catch (Exception e) {
			// Bỏ qua
		}
		return -1;
	}

	// Trích xuất tốc độ mã hóa từ output FFmpeg: speed=1.5x
	private String extractSpeed(String line) {
		try {
			int speedIdx = line.indexOf("speed=");
			if (speedIdx != -1) {
				String speed = line.substring(speedIdx + 6).split("\\s+")[0];
				return "(speed: " + speed + ")";
			}
		} catch (Exception e) {
			// Bỏ qua
		}
		return "";
	}

	// Xây dựng lệnh FFmpeg với biến thể thích ứng (4K/2K/1080p/720p/360p theo đầu vào, không phóng to)
	private List<String> buildFfmpegCommand(Path inputMp4, Path outDir, int inputHeight) {
		List<String> cmd = new ArrayList<>();
		cmd.add(ffmpegPath);
		cmd.add("-y");
		cmd.add("-i");
		cmd.add(inputMp4.toString());
		
		// Xây dựng danh sách biến thể (chỉ giảm, không phóng to)
		List<Variant> variants = new ArrayList<>();
		int variantIndex = 0;
		
		if (inputHeight >= 2160) variants.add(new Variant(variantIndex++, "v4k", 2160, "15000k", "192k"));
		if (inputHeight >= 1440) variants.add(new Variant(variantIndex++, "v2k", 1440, "8000k", "192k"));
		if (inputHeight >= 1080) variants.add(new Variant(variantIndex++, "v1080", 1080, "5000k", "128k"));
		if (inputHeight >= 720) variants.add(new Variant(variantIndex++, "v720", 720, "3000k", "128k"));
		variants.add(new Variant(variantIndex++, "v360", 360, "1000k", "96k"));
		
		// Xây dựng filter_complex: tách đầu vào, scale từng biến thể
		StringBuilder filterComplex = new StringBuilder();
		filterComplex.append(String.format("[0:v]split=%d", variants.size()));
		for (Variant v : variants) filterComplex.append("[").append(v.name).append("]");
		filterComplex.append(";");
		for (int i = 0; i < variants.size(); i++) {
			Variant v = variants.get(i);
			if (i > 0) filterComplex.append(";");
			filterComplex.append(String.format("[%s]scale=w=-2:h=%d[%sout]", v.name, v.height, v.name));
		}
		
		cmd.add("-filter_complex");
		cmd.add(filterComplex.toString());
		
		// Map và mã hóa từng biến thể
		for (Variant v : variants) {
			cmd.add("-map"); cmd.add("[" + v.name + "out]");
			cmd.add("-map"); cmd.add("0:a:0");
			cmd.add("-c:v:" + v.index); cmd.add("libx264");
			cmd.add("-b:v:" + v.index); cmd.add(v.videoBitrate);
			cmd.add("-preset:v:" + v.index); cmd.add("veryfast");
			cmd.add("-c:a:" + v.index); cmd.add("aac");
			cmd.add("-b:a:" + v.index); cmd.add(v.audioBitrate);
		}
		
		// Xây dựng var_stream_map: "v:0,a:0 v:1,a:1 ..."
		StringBuilder varStreamMap = new StringBuilder();
		for (int i = 0; i < variants.size(); i++) {
			if (i > 0) varStreamMap.append(" ");
			varStreamMap.append(String.format("v:%d,a:%d", i, i));
		}
		
		// Cài đặt đầu ra HLS
		cmd.add("-f"); cmd.add("hls");
		cmd.add("-hls_time"); cmd.add("4");
		cmd.add("-hls_playlist_type"); cmd.add("vod");
		cmd.add("-hls_list_size"); cmd.add("0");
		cmd.add("-hls_flags"); cmd.add("independent_segments+temp_file");
		cmd.add("-hls_segment_filename"); cmd.add(outDir.resolve("v%v/seg_%03d.ts").toString());
		cmd.add("-master_pl_name"); cmd.add("master.m3u8");
		cmd.add("-var_stream_map"); cmd.add(varStreamMap.toString());
		cmd.add(outDir.resolve("v%v/prog.m3u8").toString());
		
		return cmd;
	}

	// Cấu hình biến thể: độ phân giải, bitrate, tên
	private static class Variant {
		int index;
		String name;
		int height;
		String videoBitrate;
		String audioBitrate;
		
		Variant(int index, String name, int height, String videoBitrate, String audioBitrate) {
			this.index = index;
			this.name = name;
			this.height = height;
			this.videoBitrate = videoBitrate;
			this.audioBitrate = audioBitrate;
		}
		
		@Override
		public String toString() {
			return height + "p";
		}
	}
}
