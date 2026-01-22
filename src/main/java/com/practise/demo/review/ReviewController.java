package com.practise.demo.review;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepo;

    // =============================
    // ADD REVIEW (JWT SAFE)
    // =============================
    @PostMapping("/{productId}")
    public ResponseEntity<?> addReview(
            @PathVariable String productId,
            @RequestBody ReviewRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();

        if (request.getStars() < 1 || request.getStars() > 5) {
            return ResponseEntity.badRequest()
                    .body("Stars must be between 1 and 5");
        }

        Review r = new Review();
        r.setProductId(productId);
        r.setUsername(username);
        r.setStars(request.getStars());
        r.setText(request.getText());

        reviewRepo.save(r);

        return ResponseEntity.ok(r);
    }

    // =============================
    // GET REVIEWS FOR PRODUCT
    // =============================
    @GetMapping("/{productId}")
    public List<Review> getReviews(
            @PathVariable String productId
    ) {
        return reviewRepo
                .findByProductIdOrderByCreatedAtDesc(productId);
    }
}
