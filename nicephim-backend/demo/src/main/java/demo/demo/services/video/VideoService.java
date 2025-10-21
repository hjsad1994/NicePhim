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
 * Video upload and HLS transcoding service with adaptive quality variants.
 * Supports 4K/2K/1080p/720p/360p based on input resolution (no upscaling).
 */
@Service
public class VideoService {

	// Upload directory for source video files
	@Value("${media.upload.dir}")
	private String uploadDir;

	// HLS output directory (master.m3u8 + variants)
	@Value("${media.hls.dir}")
	private String hlsDir;

	// FFmpeg executable path
	@Value("${media.ffmpeg.path}")
	private String ffmpegPath;

	// Encoding status: PROCESSING, READY, FAILED
	public enum Status { PROCESSING, READY, FAILED }

	// Status tracking: videoId -> Status
	private final Map<String, Status> statusById = new ConcurrentHashMap<>();

	// FFmpeg logs: videoId -> full stderr output
	private final Map<String, String> logById = new ConcurrentHashMap<>();

	// Progress tracking: videoId -> percentage (0-100)
	private final Map<String, Double> progressById = new ConcurrentHashMap<>();

	// Upload result: videoId, HLS URL, status
	public record UploadResult(String videoId, String hlsUrl, Status status) {}

	// Upload video, save to disk, start transcoding in background (non-blocking)
	public UploadResult handleUpload(MultipartFile file) throws IOException {
		String videoId = UUID.randomUUID().toString();
		Path uploadDirPath = Paths.get(uploadDir);
		Files.createDirectories(uploadDirPath);

		// Preserve original file extension (.mp4, .ts, .mkv, etc.)
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

	// Transcode existing file in uploadDir (for migrations/re-encoding)
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

	// Get encoding status: PROCESSING/READY/FAILED
	public Status getStatus(String videoId) {
		return statusById.getOrDefault(videoId, null);
	}

	// Get FFmpeg logs for debugging
	public String getLastLog(String videoId) {
		return logById.get(videoId);
	}

	// Get progress percentage (0-100)
	public Double getProgress(String videoId) {
		return progressById.get(videoId);
	}

	// Main transcoding pipeline: detect resolution, build FFmpeg cmd, spawn background thread
	private void spawnFfmpegPipeline(Path inputMp4, Path outDir, String videoId) throws IOException {
		int inputHeight = getInputHeight(inputMp4);
		double duration = getVideoDuration(inputMp4);
		
		// Create variant directories v0-v4
		for (int i = 0; i < 5; i++) {
			Files.createDirectories(outDir.resolve("v" + i));
		}
		
		List<String> cmd = buildFfmpegCommand(inputMp4, outDir, inputHeight);
		
		// Spawn background thread (non-blocking)
		new Thread(() -> {
			try {
				
				// Start FFmpeg process with built command
				Process process = new ProcessBuilder(cmd).start();
				
				// StringBuilder to accumulate full logs for debugging
				StringBuilder sb = new StringBuilder();
				
				// STEP 6: Read FFmpeg stderr output (where progress info appears)
				// FFmpeg outputs progress to stderr, not stdout
				try (BufferedReader err = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
					String line;
					
					// Track last progress log time to throttle output
					long lastProgressTime = System.currentTimeMillis();
					
					// Read each line from FFmpeg output
					while ((line = err.readLine()) != null) {
						// Accumulate all output for full logs
						sb.append(line).append('\n');
						
						// Parse progress from FFmpeg output (appears every ~1 second)
						// Example line: "frame=  123 fps=45 q=28.0 size=1024kB time=00:00:05.12 bitrate=1638.4kbits/s speed=1.5x"
						if (line.contains("time=") && line.contains("speed=")) {
							// Throttle progress logs to every 2 seconds to avoid console spam
							long now = System.currentTimeMillis();
							if (now - lastProgressTime >= 2000) {
								// Parse current time and calculate % complete
								double progress = parseProgress(line, duration);
								if (progress >= 0) {
									// Store progress in memory for API access
									progressById.put(videoId, progress);
								}
								lastProgressTime = now;
							}
						}
					}
				}
				
				// STEP 7: Wait for FFmpeg process to complete and get exit code
				// Exit code 0 = success, non-zero = failure
				int exit = process.waitFor();
				
				// Update status based on exit code
				
				// Store full logs and update status in memory
				logById.put(videoId, sb.toString());
				statusById.put(videoId, exit == 0 ? Status.READY : Status.FAILED);
				
				// Set progress to 100% on completion or remove on failure
				if (exit == 0) {
					progressById.put(videoId, 100.0);
				} else {
					progressById.remove(videoId); // Clean up on failure
				}
				
			} catch (Exception e) {
				// Handle any exceptions during encoding (process start failure, I/O errors, etc.)
				System.err.println("❌ FFmpeg processing error for videoId " + videoId + ": " + e.getMessage());
				e.printStackTrace();
				
				// Store error details for debugging
				logById.put(videoId, String.valueOf(e));
				statusById.put(videoId, Status.FAILED);
			}
		}).start(); // Start the thread immediately (non-blocking)
	}

	/**
	 * Detects the height (vertical resolution) of input video using ffprobe.
	 * 
	 * Purpose: Determine which quality variants to generate (no upscaling).
	 * Example: 1080p video → generate 1080p, 720p, 360p (not 4K)
	 * 
	 * FFmpeg Command:
	 * ffprobe -v error -select_streams v:0 -show_entries stream=height \
	 *   -of default=noprint_wrappers=1:nokey=1 input.mp4
	 * 
	 * Output Examples:
	 * - 2160 (4K)
	 * - 1440 (2K)
	 * - 1080 (Full HD)
	 * - 720 (HD)
	 * - 360 (SD)
	 * 
	 * @param inputMp4 Path to source video file
	 * @return Video height in pixels, or 1080 as fallback if detection fails
	 */
	private int getInputHeight(Path inputMp4) {
		try {
			// Build ffprobe command to extract video height
			List<String> probeCmd = List.of(
				"ffprobe",
				"-v", "error",              // Suppress warnings, show only errors
				"-select_streams", "v:0",   // Select first video stream
				"-show_entries", "stream=height", // Extract only height field
				"-of", "default=noprint_wrappers=1:nokey=1", // Output format: raw number only
				inputMp4.toString()
			);
			
			
			// Execute ffprobe command
			Process process = new ProcessBuilder(probeCmd).start();
			
			// Read output (single line containing height number)
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			String heightStr = reader.readLine();
			process.waitFor();
			
			// Parse height string to integer
			if (heightStr != null && !heightStr.isEmpty()) {
				return Integer.parseInt(heightStr.trim());
			}
		} catch (Exception e) {
			// Silently ignore errors - return fallback
		}
		// Default fallback: assume 1080p if detection fails
		return 1080;
	}

	/**
	 * Gets total video duration in seconds using ffprobe.
	 * 
	 * Purpose: Calculate encoding progress percentage.
	 * Formula: (currentTime / totalDuration) * 100 = progress%
	 * 
	 * FFmpeg Command:
	 * ffprobe -v error -select_streams v:0 -show_entries format=duration \
	 *   -of default=noprint_wrappers=1:nokey=1 input.mp4
	 * 
	 * Output Example: 125.456 (seconds)
	 * 
	 * @param inputMp4 Path to source video file
	 * @return Video duration in seconds, or 0 if detection fails
	 */
	private double getVideoDuration(Path inputMp4) {
		try {
			// Build ffprobe command to extract video duration
			List<String> probeCmd = List.of(
				"ffprobe",
				"-v", "error",                // Suppress warnings
				"-select_streams", "v:0",     // Select first video stream
				"-show_entries", "format=duration", // Extract duration from format metadata
				"-of", "default=noprint_wrappers=1:nokey=1", // Output: raw number only
				inputMp4.toString()
			);
			
			
			// Execute ffprobe command
			Process process = new ProcessBuilder(probeCmd).start();
			
			// Read output (single line containing duration in seconds)
			BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
			String durationStr = reader.readLine();
			process.waitFor();
			
			// Parse duration string to double
			if (durationStr != null && !durationStr.isEmpty()) {
				return Double.parseDouble(durationStr.trim());
			}
		} catch (Exception e) {
			// Silently ignore errors
		}
		// Return 0 if detection fails (progress logging will be disabled)
		return 0;
	}

	/**
	 * Parses encoding progress from FFmpeg output line and calculates percentage.
	 * 
	 * FFmpeg Output Format:
	 * frame=  123 fps=45 q=28.0 size=1024kB time=00:01:23.45 bitrate=1638.4kbits/s speed=1.5x
	 * 
	 * Extraction:
	 * - Extract "time=00:01:23.45"
	 * - Parse HH:MM:SS.ms format
	 * - Convert to total seconds: 1*3600 + 1*60 + 23.45 = 83.45
	 * - Calculate percentage: (83.45 / 125.5) * 100 = 66.5%
	 * 
	 * @param line FFmpeg stderr output line
	 * @param duration Total video duration in seconds
	 * @return Progress percentage (0-100), or -1 if parsing fails
	 */
	private double parseProgress(String line, double duration) {
		try {
			// Find "time=" position in line
			int timeIdx = line.indexOf("time=");
			// Return invalid if not found or duration unknown
			if (timeIdx == -1 || duration <= 0) return -1;
			
			
			// Extract time string: "00:01:23.45" from "time=00:01:23.45 bitrate=..."
			// Split by whitespace and take first token after "time="
			String timeStr = line.substring(timeIdx + 5).split("\\s+")[0];
			
			// Parse HH:MM:SS.ms format
			if (timeStr.contains(":")) {
				String[] parts = timeStr.split(":");
				// Convert each component to seconds
				double hours = Double.parseDouble(parts[0]);   // HH
				double minutes = Double.parseDouble(parts[1]); // MM
				double seconds = Double.parseDouble(parts[2]); // SS.ms
				
				// Calculate total seconds
				double currentTime = hours * 3600 + minutes * 60 + seconds;
				
				// Calculate percentage: (current / total) * 100
				return (currentTime / duration) * 100.0;
			}
		} catch (Exception e) {
			// Silently ignore parse errors (FFmpeg output format can vary)
		}
		// Return -1 to indicate invalid/unparseable progress
		return -1;
	}

	/**
	 * Extracts encoding speed from FFmpeg output line.
	 * 
	 * Speed Meaning:
	 * - 1.0x = Realtime (10 min video encodes in 10 min)
	 * - 2.0x = 2x faster (10 min video encodes in 5 min)
	 * - 0.5x = 2x slower (10 min video encodes in 20 min)
	 * 
	 * Speed depends on:
	 * - CPU performance
	 * - Video resolution (4K slower than 1080p)
	 * - Number of variants (5 variants slower than 3)
	 * - Encoding preset (veryfast > medium > slow)
	 * 
	 * @param line FFmpeg stderr output line
	 * @return Speed string formatted as "(speed: 2.1x)" or empty string if not found
	 */
	private String extractSpeed(String line) {
		try {
			// Find "speed=" position in line
			int speedIdx = line.indexOf("speed=");
			if (speedIdx != -1) {
				// Extract "1.5x" from "speed=1.5x "
				String speed = line.substring(speedIdx + 6).split("\\s+")[0];
				// Format for console output
				return "(speed: " + speed + ")";
			}
		} catch (Exception e) {
			// Silently ignore parse errors
		}
		// Return empty string if speed not found
		return "";
	}

	/**
	 * Builds FFmpeg command with adaptive quality variants based on input resolution.
	 * 
	 * Key Principle: NO UPSCALING
	 * - 720p input → generates 720p, 360p (not 1080p, 2K, 4K)
	 * - 1080p input → generates 1080p, 720p, 360p
	 * - 4K input → generates 4K, 2K, 1080p, 720p, 360p (all variants)
	 * 
	 * Quality Variants Configuration:
	 * | Resolution | Bitrate | Audio | Condition |
	 * |------------|---------|-------|-----------|
	 * | 4K (2160p) | 15Mbps  | 192k  | input >= 2160p |
	 * | 2K (1440p) | 8Mbps   | 192k  | input >= 1440p |
	 * | 1080p      | 5Mbps   | 128k  | input >= 1080p |
	 * | 720p       | 3Mbps   | 128k  | input >= 720p  |
	 * | 360p       | 1Mbps   | 96k   | always         |
	 * 
	 * FFmpeg Filter Complex:
	 * - Split input video into N streams
	 * - Scale each stream to target resolution (w=-2 maintains aspect ratio)
	 * - Encode each variant with H.264 (libx264) and AAC audio
	 * - Output as HLS with 4-second segments
	 * 
	 * @param inputMp4 Path to source video file
	 * @param outDir Output directory for HLS files
	 * @param inputHeight Detected video height in pixels
	 * @return Complete FFmpeg command as list of arguments
	 */
	private List<String> buildFfmpegCommand(Path inputMp4, Path outDir, int inputHeight) {
		List<String> cmd = new ArrayList<>();
		
		// Base FFmpeg command
		cmd.add(ffmpegPath);        // FFmpeg executable path
		cmd.add("-y");              // Overwrite output files without asking
		cmd.add("-i");              // Input file flag
		cmd.add(inputMp4.toString()); // Input file path
		
		// ========== STEP 1: Build Variants List ==========
		// Only create variants at or below input resolution (no upscaling)
		List<Variant> variants = new ArrayList<>();
		int variantIndex = 0;
		
		// 4K (2160p) - only if input is 4K
		if (inputHeight >= 2160) {
			variants.add(new Variant(variantIndex++, "v4k", 2160, "15000k", "192k"));
		}
		
		// 2K (1440p) - only if input is 2K or higher
		if (inputHeight >= 1440) {
			variants.add(new Variant(variantIndex++, "v2k", 1440, "8000k", "192k"));
		}
		
		// 1080p - only if input is 1080p or higher
		if (inputHeight >= 1080) {
			variants.add(new Variant(variantIndex++, "v1080", 1080, "5000k", "128k"));
		}
		
		// 720p - only if input is 720p or higher
		if (inputHeight >= 720) {
			variants.add(new Variant(variantIndex++, "v720", 720, "3000k", "128k"));
		}
		
		// 360p - always include as lowest quality
		variants.add(new Variant(variantIndex++, "v360", 360, "1000k", "96k"));
		
		// Build filter_complex string
		StringBuilder filterComplex = new StringBuilder();
		filterComplex.append(String.format("[0:v]split=%d", variants.size()));
		for (Variant v : variants) {
			filterComplex.append("[").append(v.name).append("]");
		}
		filterComplex.append(";");
		
		for (int i = 0; i < variants.size(); i++) {
			Variant v = variants.get(i);
			if (i > 0) filterComplex.append(";");
			filterComplex.append(String.format("[%s]scale=w=-2:h=%d[%sout]", v.name, v.height, v.name));
		}
		
		cmd.add("-filter_complex");
		cmd.add(filterComplex.toString());
		
		// Add mapping for each variant
		for (Variant v : variants) {
			cmd.add("-map");
			cmd.add("[" + v.name + "out]");
			cmd.add("-map");
			cmd.add("0:a:0");
			cmd.add("-c:v:" + v.index);
			cmd.add("libx264");
			cmd.add("-b:v:" + v.index);
			cmd.add(v.videoBitrate);
			cmd.add("-preset:v:" + v.index);
			cmd.add("veryfast");
			cmd.add("-c:a:" + v.index);
			cmd.add("aac");
			cmd.add("-b:a:" + v.index);
			cmd.add(v.audioBitrate);
		}
		
		// Build var_stream_map
		StringBuilder varStreamMap = new StringBuilder();
		for (int i = 0; i < variants.size(); i++) {
			if (i > 0) varStreamMap.append(" ");
			varStreamMap.append(String.format("v:%d,a:%d", i, i));
		}
		
		// HLS settings
		cmd.add("-f");
		cmd.add("hls");
		cmd.add("-hls_time");
		cmd.add("4");
		cmd.add("-hls_playlist_type");
		cmd.add("vod");
		cmd.add("-hls_list_size");
		cmd.add("0");
		cmd.add("-hls_flags");
		cmd.add("independent_segments+temp_file");
		cmd.add("-hls_segment_filename");
		cmd.add(outDir.resolve("v%v/seg_%03d.ts").toString());
		cmd.add("-master_pl_name");
		cmd.add("master.m3u8");
		cmd.add("-var_stream_map");
		cmd.add(varStreamMap.toString());
		cmd.add(outDir.resolve("v%v/prog.m3u8").toString());
		
		return cmd;
	}

	// Helper class for variant configuration
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
