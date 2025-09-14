package demo.demo.controller.video;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/video-test")
public class VideoTestController {

	@Value("${media.hls.dir}")
	private String hlsDir;

	@GetMapping("/directory")
	public Map<String, Object> testDirectory() {
		Map<String, Object> result = new HashMap<>();
		
		try {
			Path hlsPath = Paths.get(hlsDir);
			result.put("hlsDir", hlsDir);
			result.put("hlsPath", hlsPath.toAbsolutePath().toString());
			result.put("exists", Files.exists(hlsPath));
			result.put("isDirectory", Files.isDirectory(hlsPath));
			result.put("canWrite", Files.isWritable(hlsPath));
			
			// Try to create a test file
			Path testFile = hlsPath.resolve("test.txt");
			Files.write(testFile, "Test content".getBytes());
			result.put("canCreateFile", Files.exists(testFile));
			
			// Clean up
			Files.deleteIfExists(testFile);
			
		} catch (Exception e) {
			result.put("error", e.getMessage());
			result.put("exception", e.getClass().getSimpleName());
		}
		
		return result;
	}

	@GetMapping("/create-hls")
	public Map<String, Object> createTestHLS() {
		Map<String, Object> result = new HashMap<>();
		
		try {
			String testVideoId = "test-" + System.currentTimeMillis();
			Path outDir = Paths.get(hlsDir).resolve(testVideoId);
			
			result.put("videoId", testVideoId);
			result.put("outputDir", outDir.toAbsolutePath().toString());
			
			// Create directory
			Files.createDirectories(outDir);
			result.put("directoryCreated", Files.exists(outDir));
			
			// Create master.m3u8
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
			result.put("masterFileCreated", Files.exists(masterFile));
			result.put("masterFileSize", Files.size(masterFile));
			
			// Create variant directories and files
			for (int i = 0; i < 3; i++) {
				Path variantDir = outDir.resolve("v" + i);
				Files.createDirectories(variantDir);
				result.put("variantDir" + i + "Created", Files.exists(variantDir));
				
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
				result.put("variantFile" + i + "Created", Files.exists(variantFile));
				
				// Create segment files
				Path seg1 = variantDir.resolve("seg_000.ts");
				Path seg2 = variantDir.resolve("seg_001.ts");
				Files.write(seg1, new byte[0]);
				Files.write(seg2, new byte[0]);
				result.put("segmentFiles" + i + "Created", Files.exists(seg1) && Files.exists(seg2));
			}
			
			result.put("success", true);
			result.put("message", "Test HLS files created successfully");
			
		} catch (Exception e) {
			result.put("success", false);
			result.put("error", e.getMessage());
			result.put("exception", e.getClass().getSimpleName());
			e.printStackTrace();
		}
		
		return result;
	}
}