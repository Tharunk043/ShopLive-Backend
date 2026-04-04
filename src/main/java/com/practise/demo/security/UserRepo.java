package com.practise.demo.security;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepo extends MongoRepository<User, String> {
	Optional<User> findByName(String name);
	Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
