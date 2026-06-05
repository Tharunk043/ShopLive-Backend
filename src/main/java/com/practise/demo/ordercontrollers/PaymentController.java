package com.practise.demo.ordercontrollers;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.practise.demo.entity.Order;
import com.practise.demo.repository.OrderRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Autowired
    private OrderRepository orderRepo;

    @PostConstruct
    public void init() {
        // Initialize Stripe SDK with secret key
        Stripe.apiKey = stripeSecretKey;
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> createCheckoutSession(
            @RequestBody List<Order> orders,
            Authentication authentication,
            HttpServletRequest request
    ) {
        try {
            // Get customer ID from JWT
            String customerId = authentication.getName();

            if (orders == null || orders.isEmpty()) {
                return ResponseEntity.badRequest().body("🛒 Cart is empty");
            }

            // Derive frontend base URL from Referer header dynamically
            String referer = request.getHeader("Referer");
            if (referer == null || referer.isEmpty()) {
                referer = "http://localhost:5173/";
            }
            if (referer.endsWith("/")) {
                referer = referer.substring(0, referer.length() - 1);
            }

            // Success and Cancel URLs
            String successUrl = referer + "/dashboard?session_id={CHECKOUT_SESSION_ID}";
            String cancelUrl = referer + "/shopping";

            List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

            for (Order order : orders) {
                // Stripe requires amounts in cents/paise (e.g. INR * 100)
                long unitAmount = (long) (order.getPrice() * 100);

                SessionCreateParams.LineItem.PriceData.ProductData productData =
                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                .setName(order.getName())
                                .build();

                SessionCreateParams.LineItem.PriceData priceData =
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount(unitAmount)
                                .setProductData(productData)
                                .build();

                SessionCreateParams.LineItem lineItem =
                        SessionCreateParams.LineItem.builder()
                                .setQuantity((long) order.getCount())
                                .setPriceData(priceData)
                                .build();

                lineItems.add(lineItem);
            }

            // Create Checkout Session
            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .addAllLineItem(lineItems)
                    .build();

            Session session = Session.create(params);

            // Save orders locally in 'PENDING_PAYMENT' state
            for (Order order : orders) {
                order.setCustomerId(customerId);
                order.setStatus("PENDING_PAYMENT");
                order.setStripeSessionId(session.getId());
            }
            orderRepo.saveAll(orders);

            // Return redirect URL to frontend
            Map<String, String> responseData = new HashMap<>();
            responseData.put("url", session.getUrl());
            responseData.put("sessionId", session.getId());

            return ResponseEntity.ok(responseData);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating payment session: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestParam("sessionId") String sessionId) {
        try {
            // Retrieve Stripe Session
            Session session = Session.retrieve(sessionId);

            if ("paid".equals(session.getPaymentStatus())) {
                // Find all pending orders for this session and mark them as PAID
                List<Order> orders = orderRepo.findByStripeSessionId(sessionId);
                if (orders.isEmpty()) {
                    return ResponseEntity.status(404).body("No orders found for this session");
                }

                for (Order order : orders) {
                    order.setStatus("PAID");
                }
                orderRepo.saveAll(orders);

                return ResponseEntity.ok("✅ Payment verified. Order status updated to PAID.");
            } else {
                return ResponseEntity.status(400).body("❌ Payment status is: " + session.getPaymentStatus());
            }

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error verifying payment: " + e.getMessage());
        }
    }
}
