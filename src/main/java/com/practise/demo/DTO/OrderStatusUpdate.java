package com.practise.demo.DTO;


public class OrderStatusUpdate {

    private String orderId;
    private String status;

    public OrderStatusUpdate(String orderId, String status) {
        this.orderId = orderId;
        this.status = status;
    }

    public String getOrderId() {
        return orderId;
    }

    public String getStatus() {
        return status;
    }
}