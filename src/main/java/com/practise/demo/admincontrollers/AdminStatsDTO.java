package com.practise.demo.admincontrollers;

public class AdminStatsDTO {

    private long totalCustomers;
    private long totalOrders;
    private long totalProducts;

    public AdminStatsDTO(long customers, long orders, long products) {
        this.totalCustomers = customers;
        this.totalOrders = orders;
        this.totalProducts = products;
    }

    public long getTotalCustomers() { return totalCustomers; }
    public long getTotalOrders() { return totalOrders; }
    public long getTotalProducts() { return totalProducts; }
}
