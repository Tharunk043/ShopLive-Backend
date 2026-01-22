package com.practise.demo.admincontrollers;

import com.practise.demo.entity.Order;
import com.practise.demo.product.Product;
import com.practise.demo.product.ProductService;
import com.practise.demo.repository.OrderRepository;
import com.practise.demo.security.User;
import com.practise.demo.security.UserRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderRepository orderRepo;

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                    .withZone(ZoneId.systemDefault());

    // ==========================
    // PRODUCTS
    // ==========================

    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return productService.getAll();
    }

    @PostMapping("/products/upload")
    public Product uploadProduct(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam MultipartFile image
    ) throws Exception {

        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(price);
        p.setImage(Base64.getEncoder().encodeToString(image.getBytes()));

        return productService.create(p);
    }

    @DeleteMapping("/products/{id}")
    public void deleteProduct(@PathVariable String id) {
        productService.delete(id);
    }

    // ==========================
    // CUSTOMERS
    // ==========================

    @GetMapping("/customers")
    public List<User> getAllCustomers() {
        return userRepo.findAll();
    }

    @DeleteMapping("/customers/{id}")
    public void deleteCustomer(@PathVariable String id) {

        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Orders are saved using username (vtk)
        List<Order> orders =
                orderRepo.findByCustomerIdOrderByCreatedAtDesc(user.getName());

        orderRepo.deleteAll(orders);
        userRepo.deleteById(id);
    }

    // ==========================
    // CUSTOMER ORDERS
    // ==========================

    @GetMapping("/customers/{id}/orders")
    public List<CustomerOrderSummaryDTO> getCustomerOrders(
            @PathVariable String id
    ) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> orders =
                orderRepo.findByCustomerIdOrderByCreatedAtDesc(user.getName());

        return orders.stream()
                .map(o -> new CustomerOrderSummaryDTO(
                        o.getId(),
                        o.getName(),
                        o.getCount(),
                        o.getPrice(),
                        o.getCreatedAt(),
                        o.getStatus()
                ))

                .collect(Collectors.toList());
    }

        // ==========================
    // ORDER ACTIONS
    // ==========================

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String status
    ) {
        return orderRepo.findById(orderId)
                .map(o -> {
                    o.setStatus(status);
                    orderRepo.save(o);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @DeleteMapping("/orders/{orderId}")
    public void deleteOrder(@PathVariable String orderId) {
        orderRepo.deleteById(orderId);
    }

    // ==========================
    // STATS
    // ==========================

    @GetMapping("/stats")
    public AdminStatsDTO getStats() {
        return new AdminStatsDTO(
                userRepo.count(),
                orderRepo.count(),
                productService.count()
        );
    }

}
