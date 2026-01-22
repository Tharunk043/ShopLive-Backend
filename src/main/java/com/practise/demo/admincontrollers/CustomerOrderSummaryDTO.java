package com.practise.demo.admincontrollers;

import java.time.Instant;

public class CustomerOrderSummaryDTO {

    private String id;
    private String name;
    private int count;
    private double price;
    private Instant createdAt;
    private String status;

    public CustomerOrderSummaryDTO() {}

    public CustomerOrderSummaryDTO(
            String id,
            String name,
            int count,
            double price,
            Instant createdAt,
            String status
    ) {
        this.id = id;
        this.name = name;
        this.count = count;
        this.price = price;
        this.createdAt = createdAt;
        this.status = status;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public int getCount() { return count; }
    public double getPrice() { return price; }
    public Instant getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }
}
