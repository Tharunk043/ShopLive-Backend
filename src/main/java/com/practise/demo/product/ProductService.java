package com.practise.demo.product;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Product create(Product product) {
        return repo.save(product);
    }

    public List<Product> getAll() {
        return repo.findAll();
    }

    public Product getById(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public void delete(String id) {
        repo.deleteById(id);
    }
    public long count() {
        return repo.count();
    }

}
