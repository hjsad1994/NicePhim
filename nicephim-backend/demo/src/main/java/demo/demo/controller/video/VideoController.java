package demo.demo.controller.video;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import demo.demo.services.video.VideoService;
import demo.demo.services.video.VideoService.Status;

@RestController
@RequestMapping("/api/videos")
@CrossOrigin(origins = "http://localhost:3000")
public class VideoController {

	private final VideoService videoService;

	public VideoController(VideoService videoService) {
		this.videoService = videoService;
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public Map<String, Object> upload(@RequestPart("file") MultipartFile file) throws Exception {
		var result = videoService.handleUpload(file);
		return Map.of(
			"videoId", result.videoId(),
			"hlsUrl", result.hlsUrl(),
			"status", result.status().name()
		);
	}

	@PostMapping(path = "/ingest")
	public Map<String, Object> ingest(@RequestParam("filename") String filename) throws Exception {
		if (filename == null || filename.isBlank()) {
			return Map.of(
				"error", "filename is required"
			);
		}
		var result = videoService.ingestExisting(filename);
		return Map.of(
			"videoId", result.videoId(),
			"hlsUrl", result.hlsUrl(),
			"status", result.status().name()
		);
	}

	@GetMapping("/{videoId}/status")
	public Map<String, Object> status(@PathVariable String videoId) {
		Status status = videoService.getStatus(videoId);
		if (status == null) {
			Map<String, Object> resp = new LinkedHashMap<>();
			resp.put("videoId", videoId);
			resp.put("status", "UNKNOWN");
			resp.put("hlsUrl", "/videos/" + videoId + "/master.m3u8");
			resp.put("log", "");
			return resp;
		}
		Map<String, Object> resp = new LinkedHashMap<>();
		resp.put("videoId", videoId);
		resp.put("status", status.name());
		resp.put("hlsUrl", "/videos/" + videoId + "/master.m3u8");
		String log = videoService.getLastLog(videoId);
		resp.put("log", log == null ? "" : log);
		return resp;
	}
}