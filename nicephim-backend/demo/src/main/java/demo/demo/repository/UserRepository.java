package demo.demo.repository;

import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Map;

@Repository
public class UserRepository {

	private final JdbcTemplate jdbcTemplate;

	public UserRepository(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	public UUID insertUser(String username, String email, byte[] passwordHash, String displayName) throws DuplicateKeyException {
		UUID userId = UUID.randomUUID();
		jdbcTemplate.update(
			"INSERT INTO dbo.users (user_id, username, email, password_hash, display_name) VALUES (?,?,?,?,?)",
			userId, username, email, passwordHash, displayName
		);
		return userId;
	}

	public Map<String, Object> findUserByUsername(String username) {
		try {
			return jdbcTemplate.queryForMap(
				"SELECT user_id, username, email, password_hash, display_name, created_at FROM dbo.users WHERE username = ?",
				username
			);
		} catch (Exception e) {
			return null;
		}
	}

	public Map<String, Object> findByUsernameOrEmail(String usernameOrEmail) {
		try {
			return jdbcTemplate.queryForMap(
				"SELECT user_id, username, email, password_hash, display_name, created_at FROM dbo.users WHERE username = ? OR email = ?",
				usernameOrEmail, usernameOrEmail
			);
		} catch (Exception e) {
			return null;
		}
	}
}


