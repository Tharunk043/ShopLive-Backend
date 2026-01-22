package com.practise.demo.repository;

import com.practise.demo.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository
        extends MongoRepository<Customer, String> {

    // Used by searchCustomers(...)
    Page<Customer> findByNameContainingIgnoreCase(
            String name,
            Pageable pageable
    );
}
