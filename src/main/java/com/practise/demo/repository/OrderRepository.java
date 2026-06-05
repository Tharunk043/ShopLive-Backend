package com.practise.demo.repository;

import com.practise.demo.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository
        extends MongoRepository<Order, String> {

    // 🔥 Correct Mongo field name + type
    List<Order> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<Order> findByStripeSessionId(String stripeSessionId);
}
