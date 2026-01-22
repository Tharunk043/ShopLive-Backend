package com.practise.demo.security;


import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    public CustomUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {

        User user = userRepo.findByName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        List<String> roles = user.getRoles();

        // 🔥 Fallback for normal users
        if (roles == null || roles.isEmpty()) {
            roles = List.of("ROLE_USER");
        }

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getName())
                .password(user.getPassword())
                .authorities(
                        roles.stream()
                                .map(SimpleGrantedAuthority::new)
                                .toList()
                )
                .build();
    }



}
