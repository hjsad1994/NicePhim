package demo.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HelloController {

	@GetMapping("/hello")
	public Map<String, Object> hello() {
		Map<String, Object> res = new HashMap<>();
		res.put("message", "Hello from Spring Boot!");
		res.put("timestamp", Instant.now().toString());
		return res;
	}

	@GetMapping("/hello/{name}")
	public Map<String, Object> helloName(@PathVariable String name) {
		Map<String, Object> res = new HashMap<>();
		res.put("message", "Hello, " + name);
		res.put("timestamp", Instant.now().toString());
		return res;
	}
}


