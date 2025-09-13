package demo.demo;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/db")
public class DbHealthController {

	private final JdbcTemplate jdbcTemplate;

	public DbHealthController(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@GetMapping("/health")
	public Map<String, Object> health() {
		Map<String, Object> res = new HashMap<>();
		try {
			Integer one = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
			res.put("status", "UP");
			res.put("result", one);
		} catch (Exception ex) {
			res.put("status", "DOWN");
			res.put("error", ex.getMessage());
		}
		return res;
	}
}


