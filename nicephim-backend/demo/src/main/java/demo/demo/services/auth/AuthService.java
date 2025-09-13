package demo.demo.services.auth;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import demo.demo.repository.UserRepository;
import demo.demo.dto.auth.RegisterRequest;
import demo.demo.dto.auth.LoginRequest;

@Service
public class AuthService {

	private final UserRepository userRepository;

	public AuthService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public UUID register(RegisterRequest dto) {
		String username = dto.username == null ? null : dto.username.trim();
		String email = dto.email == null ? null : dto.email.trim().toLowerCase();
		String displayName = dto.displayName;
		String password = dto.password;
		if (username == null || username.isEmpty() || email == null || email.isEmpty() || password == null || password.length() < 6) {
			throw new IllegalArgumentException("Invalid input");
		}
		String hash = BCrypt.hashpw(password, BCrypt.gensalt(10));
		try {
			UUID created = userRepository.insertUser(username, email, hash.getBytes(), displayName);
			return created;
		} catch (DuplicateKeyException e) {
			throw new IllegalStateException("Username or email already exists");
		}
	}

	public Map<String, Object> login(LoginRequest dto) {
		String username = dto.username == null ? null : dto.username.trim();
		String password = dto.password;
		
		if (username == null || username.isEmpty() || password == null) {
			throw new IllegalArgumentException("Username và password không được để trống");
		}
		
		// Tìm user theo username hoặc email
		Map<String, Object> user = userRepository.findByUsernameOrEmail(username);
		if (user == null) {
			throw new IllegalArgumentException("Tài khoản không tồn tại");
		}
		
		// Kiểm tra password
		String storedHash = new String((byte[]) user.get("password_hash"));
		if (!BCrypt.checkpw(password, storedHash)) {
			throw new IllegalArgumentException("Mật khẩu không đúng");
		}
		
		// Tạo response user info (không bao gồm password)
		Map<String, Object> userInfo = new HashMap<>();
		userInfo.put("id", user.get("id"));
		userInfo.put("username", user.get("username"));
		userInfo.put("email", user.get("email"));
		userInfo.put("display_name", user.get("display_name"));
		userInfo.put("created_at", user.get("created_at"));
		
		return userInfo;
	}
}
