package demo.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DemoController {

	@GetMapping("/")
	public String home() {
		return "redirect:/watch-together.html";
	}

	@GetMapping("/watch-together")
	public String watchTogether() {
		return "redirect:/watch-together.html";
	}
}



