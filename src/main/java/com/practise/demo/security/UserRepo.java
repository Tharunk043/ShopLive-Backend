package com.practise.demo.security;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepo extends MongoRepository<User, String> {
	Optional<User> findByName(String name);
}
