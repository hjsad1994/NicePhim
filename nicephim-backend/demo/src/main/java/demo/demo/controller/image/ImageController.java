package demo.demo.controller.image;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:3000")
public class ImageController {

    @Value("${media.poster.dir}")
    private String posterDir;

    @Value("${media.banner.dir}")
    private String bannerDir;

    @PostMapping("/upload/poster")
    public ResponseEntity<Map<String, Object>> uploadPoster(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, posterDir, "poster");
    }

    @PostMapping("/upload/banner")
    public ResponseEntity<Map<String, Object>> uploadBanner(@RequestParam("file") MultipartFile file) {
        return uploadImage(file, bannerDir, "banner");
    }

    private ResponseEntity<Map<String, Object>> uploadImage(MultipartFile file, String uploadDir, String imageType) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate file
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("error", "File không được để trống");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("error", "Chỉ được upload file hình ảnh");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size (max 10MB for images)
            if (file.getSize() > 10 * 1024 * 1024) {
                response.put("success", false);
                response.put("error", "Kích thước file không được vượt quá 10MB");
                return ResponseEntity.badRequest().body(response);
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Generate full URL for the uploaded image
            String imageUrl = "http://localhost:8080/" + uniqueFilename;

            response.put("success", true);
            response.put("message", "Upload " + imageType + " thành công!");
            response.put("data", Map.of(
                "filename", uniqueFilename,
                "originalName", originalFilename,
                "url", imageUrl,
                "size", file.getSize(),
                "contentType", contentType
            ));

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("error", "Lỗi khi lưu file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/delete/poster/{filename}")
    public ResponseEntity<Map<String, Object>> deletePoster(@PathVariable String filename) {
        return deleteImage(filename, posterDir, "poster");
    }

    @DeleteMapping("/delete/banner/{filename}")
    public ResponseEntity<Map<String, Object>> deleteBanner(@PathVariable String filename) {
        return deleteImage(filename, bannerDir, "banner");
    }

    private ResponseEntity<Map<String, Object>> deleteImage(String filename, String uploadDir, String imageType) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Path filePath = Paths.get(uploadDir, filename);
            
            if (!Files.exists(filePath)) {
                response.put("success", false);
                response.put("error", "File không tồn tại");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            Files.delete(filePath);

            response.put("success", true);
            response.put("message", "Xóa " + imageType + " thành công!");

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("error", "Lỗi khi xóa file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}