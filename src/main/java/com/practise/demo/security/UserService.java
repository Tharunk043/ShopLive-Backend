package com.practise.demo.security;

import java.util.List;
import java.util.Optional;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService,
                       CustomUserDetailsService userDetailsService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    // =========================
    // REGISTER
    // =========================
    public User saveUser(User user) {

        // Encrypt password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // ✅ Assign default role if missing
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(List.of("ROLE_USER"));
        }

        return userRepo.save(user);
    }


    // =========================
    // LOGIN / AUTH
    // =========================
    public String verify(User user) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        user.getName(),
                        user.getPassword()
                )
        );

        if (authentication.isAuthenticated()) {

            // We only need username now
            return jwtService.generateAccessToken(user.getName());
        }

        throw new RuntimeException("Invalid credentials");
    }

    // =========================
    // GET USER
    // =========================
    public Optional<User> getUserById(String id) {
        System.out.println("📌 Fetching from Database...");
        return userRepo.findById(id);
    }
    // =========================
// GET USER BY NAME
// =========================
    public User getUserByName(String name) {
        return userRepo.findByName(name)
                .orElseThrow(() -> new RuntimeException("User not found: " + name));
    }

}
