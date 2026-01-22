package com.practise.demo.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "orders")
public class Order {

	@Id
	private String id;

	// 🔐 JWT subject (customer id)
	@Indexed
	private String customerId;

	// Product reference
	private String productId;

	// Product name at time of order (for history safety)
	private String name;

	// Quantity
	private int count;

	// Price at time of order
	private double price;

	// Order time
	private Instant createdAt = Instant.now();

	private String status = "PLACED";

	// =====================
	// GETTERS & SETTERS
	// =====================

	public String getId() {
		return id;
	}

	public String getCustomerId() {
		return customerId;
	}

	public void setCustomerId(String customerId) {
		this.customerId = customerId;
	}

	public String getProductId() {
		return productId;
	}

	public void setProductId(String productId) {
		this.productId = productId;
	}

	public String getName() {
		return name;
	}

	// product name
	public void setName(String name) {
		this.name = name;
	}

	public int getCount() {
		return count;
	}

	// quantity
	public void setCount(int count) {
		this.count = count;
	}

	public double getPrice() {
		return price;
	}

	// price snapshot
	public void setPrice(double price) {
		this.price = price;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
