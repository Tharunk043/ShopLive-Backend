package com.practise.demo.security;

import com.practise.demo.DTO.RegisterDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class UserRegistration {

	@Autowired
	private UserService userservice;

	@Autowired
	private UserRepo userRepo;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private GoogleAuthService googleAuthService;

	@Autowired
	private UserDetailsService userDetailsService;
	@Autowired
	private  PasswordEncoder passwordEncoder;

	// =========================
	// REGISTER
	// =========================
	@PostMapping("/register")
	public ResponseEntity<?> getregister(@RequestBody User user) {

		if (user.getName() == null || user.getName().trim().length() < 3) {
			return ResponseEntity.badRequest().body(Map.of("message", "Username must be at least 3 characters long."));
		}

		if (user.getPassword() == null || user.getPassword().length() < 6) {
			return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters long."));
		}

		if (userRepo.findByName(user.getName().trim()).isPresent()) {
			return ResponseEntity.badRequest().body(Map.of("message", "Username already exists. Please choose another."));
		}

		user.setName(user.getName().trim());
		if (user.getEmail() != null) {
			user.setEmail(user.getEmail().trim().toLowerCase());
		}

		User savedUser = userservice.saveUser(user);

		RegisterDTO dto = new RegisterDTO();
		dto.setId(savedUser.getId());
		dto.setName(savedUser.getName());

		return ResponseEntity.ok(dto);
	}

	// =========================
	// NORMAL LOGIN
	// =========================
	@PostMapping("/auth/login")
	public Map<String, Object> login(@RequestBody User user) {

		String accessToken = userservice.verify(user);

		User dbUser = userservice.getUserByName(user.getName());

		String refreshToken = jwtService.generateRefreshToken();
		jwtService.saveRefreshToken(user.getName(), refreshToken);

		return Map.of(
				"customerId", dbUser.getId(),
				"accessToken", accessToken,
				"refreshToken", refreshToken,
				"username",user.getName()
		);
	}


	// =========================
	// REFRESH TOKEN
	// =========================
	// =========================
// REFRESH TOKEN
// =========================
	@PostMapping("/auth/refresh")
	public Map<String, String> refresh(@RequestBody Map<String, String> body) {

		String refreshToken = body.get("refreshToken");

		String username =
				jwtService.validateRefreshToken(refreshToken);

		String newAccessToken =
				jwtService.generateAccessToken(username);

		return Map.of("accessToken", newAccessToken);
	}

	// =========================
// GOOGLE LOGIN
// =========================
	@PostMapping("/auth/google")
	public Map<String, Object> googleLogin(@RequestBody GoogleAuthRequest req) throws Exception {

		var payload =
				googleAuthService.verify(req.getToken());

		String email = payload.getEmail();

		User user = userRepo.findByName(email)
				.orElseGet(() -> {
					User u = new User();
					u.setName(email);
					u.setPassword(passwordEncoder.encode("GOOGLE"));
					u.setRoles(List.of("ROLE_USER")); // ✅ ADD THIS
					return userRepo.save(u);
				});


		String accessToken =
				jwtService.generateAccessToken(user.getName());

		String refreshToken =
				jwtService.generateRefreshToken();

		jwtService.saveRefreshToken(user.getName(), refreshToken);

		return Map.of(
				"customerId", user.getId(),
				"accessToken", accessToken,
				"refreshToken", refreshToken,
				"username",user.getName().split("@")[0]
		);
	}



	// =========================
	// GET USER
	// =========================
	@GetMapping("/user/{id}")
	public Optional<User> getprod(@PathVariable String id) {
		return userservice.getUserById(id);
	}
}
