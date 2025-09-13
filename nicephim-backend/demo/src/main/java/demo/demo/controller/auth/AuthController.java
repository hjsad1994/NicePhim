package demo.demo.controller.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import demo.demo.dto.auth.RegisterRequest;
import demo.demo.dto.auth.LoginRequest;
import demo.demo.services.auth.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/register")
	public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest dto) {
		try {
			UUID userId = authService.register(dto);
			Map<String, Object> res = new HashMap<>();
			res.put("success", true);
			res.put("user_id", userId.toString());
			res.put("message", "Đăng ký thành công!");
			return ResponseEntity.ok(res);
		} catch (Exception e) {
			Map<String, Object> res = new HashMap<>();
			res.put("success", false);
			res.put("error", e.getMessage());
			return ResponseEntity.badRequest().body(res);
		}
	}

	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest dto) {
		try {
			Map<String, Object> user = authService.login(dto);
			Map<String, Object> res = new HashMap<>();
			res.put("success", true);
			res.put("user", user);
			res.put("message", "Đăng nhập thành công!");
			return ResponseEntity.ok(res);
		} catch (Exception e) {
			Map<String, Object> res = new HashMap<>();
			res.put("success", false);
			res.put("error", e.getMessage());
			return ResponseEntity.badRequest().body(res);
		}
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
		Map<String, Object> res = new HashMap<>();
		res.put("error", ex.getMessage());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<Map<String, Object>> handleConflict(IllegalStateException ex) {
		Map<String, Object> res = new HashMap<>();
		res.put("error", ex.getMessage());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(res);
	}
}


