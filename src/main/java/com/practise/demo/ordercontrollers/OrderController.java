package com.practise.demo.ordercontrollers;

import com.practise.demo.entity.Order;
import com.practise.demo.repository.OrderRepository;
import com.practise.demo.rt.OrderRateLimiter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderRateLimiter orderRateLimiter;

    // ================================
    // 🔐 PLACE ORDER (JWT SAFE + RATE LIMITED)
    // ================================
    @PostMapping
    public ResponseEntity<?> placeOrders(
            @RequestBody List<Order> orders,
            Authentication authentication
    ) {
        // JWT subject = customerId
        String customerId = authentication.getName();

        // 🚦 Rate limit check
        if (!orderRateLimiter.allowOrder(customerId)) {
            return ResponseEntity.status(429)
                    .body("🚫 Rate limit exceeded: Only 3 order requests allowed per minute");
        }

        // Keep your original logic
        orders.forEach(o -> o.setCustomerId(customerId));
        orderRepo.saveAll(orders);

        return ResponseEntity.ok("✅ Orders placed successfully");
    }
}
