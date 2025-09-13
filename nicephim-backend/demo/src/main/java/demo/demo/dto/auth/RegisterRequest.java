package demo.demo.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
	@NotBlank
	public String username;

	@NotBlank
	@Email
	public String email;

	@NotBlank
	@Size(min = 6, max = 100)
	public String password;

	public String displayName;
}


