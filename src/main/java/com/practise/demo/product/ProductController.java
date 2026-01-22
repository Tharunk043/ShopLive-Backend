package com.practise.demo.product;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/products")
@CrossOrigin
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    // CREATE PRODUCT WITH IMAGE
    @PostMapping("/upload")
    public ResponseEntity<Product> create(
            @RequestParam String name,
            @RequestParam String description,
            @RequestParam double price,
            @RequestParam MultipartFile image
    ) throws Exception {

        Product p = new Product();
        p.setName(name);
        p.setDescription(description);
        p.setPrice(price);

        // Convert image to Base64
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        p.setImage(base64Image);

        return ResponseEntity.ok(service.create(p));
    }

    // GET ALL PRODUCTS
    @GetMapping
    public List<Product> getAll() {
        System.out.println("from mongo");
        return service.getAll();
    }

    // GET PRODUCT BY ID
    @GetMapping("/{id}")
    public Product getById(@PathVariable String id) {
        return service.getById(id);
    }

    // DELETE PRODUCT
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
    // ================================
// GET PRODUCT IMAGE (JWT SAFE)
// ================================
    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getProductImage(@PathVariable String id) {

        Product p = service.getById(id);

        byte[] imageBytes = Base64
                .getDecoder()
                .decode(p.getImage());

        return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .body(imageBytes);
    }

}
