package com.practise.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.*;

@Service
public class JwtService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private UserRepo userRepo;

    // ======================
    // CONFIG
    // ======================
    private static final String SECRET_KEY_BASE64 =
            "9KpIrDrlLsfd5XF3ba7tAI58KMFxIQLS5oepfjiJdvg=";

    private static final long ACCESS_TOKEN_TTL_MS = 1000 * 60 * 10; // 10 minutes
    private static final long REFRESH_TTL_DAYS = 7;

    private final SecretKey key =
            Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRET_KEY_BASE64));

    // ======================
    // ACCESS TOKEN
    // ======================
    public String generateAccessToken(String username) {

        User user = userRepo.findByName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> claims = new HashMap<>();

        // Store Mongo user ID in token
        claims.put("userId", user.getId());

        // 🔥 Load roles from Mongo (fallback to ROLE_USER)
        List<String> roles = user.getRoles();
        if (roles == null || roles.isEmpty()) {
            roles = List.of("ROLE_USER");
        }

        claims.put("roles", roles);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuer("SpringSecurity")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_TTL_MS))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }


    // ======================
    // CLAIMS
    // ======================
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractUserId(String token) {
        return extractClaims(token).get("userId", String.class);
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .setAllowedClockSkewSeconds(5) // prevents small time drift issues
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ======================
    // REFRESH TOKEN
    // ======================
    public String generateRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public void saveRefreshToken(String username, String refreshToken) {
        redisTemplate.opsForValue().set(
                refreshKey(refreshToken),
                username,
                Duration.ofDays(REFRESH_TTL_DAYS)
        );
    }

    public String validateRefreshToken(String refreshToken) {
        String username =
                redisTemplate.opsForValue().get(refreshKey(refreshToken));

        if (username == null) {
            throw new RuntimeException("Invalid or expired refresh token");
        }

        return username;
    }

    // ======================
    // ROTATION (OPTIONAL BUT RECOMMENDED)
    // ======================
    public String rotateRefreshToken(String oldToken) {
        String username = validateRefreshToken(oldToken);

        // delete old token
        redisTemplate.delete(refreshKey(oldToken));

        // issue new token
        String newToken = generateRefreshToken();
        saveRefreshToken(username, newToken);

        return newToken;
    }

    private String refreshKey(String token) {
        return "refresh:" + token;
    }
    public Claims extractAllClaims(String token) {
        return extractClaims(token);
    }
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);

        return username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

}
