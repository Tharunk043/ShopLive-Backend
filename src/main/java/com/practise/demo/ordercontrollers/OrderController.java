package com.practise.demo.ordercontrollers;

import com.practise.demo.entity.Order;
import com.practise.demo.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepo;

    // ================================
    // 🔐 PLACE ORDER (JWT SAFE)
    // ================================
    @PostMapping
    public ResponseEntity<?> placeOrders(
            @RequestBody List<Order> orders,
            Authentication authentication
    ) {
        // JWT subject = customerId
        String customerId = authentication.getName();

        orders.forEach(o -> {
            o.setCustomerId(customerId);
        });

        orderRepo.saveAll(orders);

        return ResponseEntity.ok().build();
    }
}
