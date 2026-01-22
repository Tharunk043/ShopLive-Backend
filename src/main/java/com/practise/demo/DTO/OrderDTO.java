package com.practise.demo.DTO;

import java.io.Serializable;

public class OrderDTO implements Serializable {
    private String id;
    private String productName;

    public OrderDTO() {}
    public OrderDTO(String id, String productName) {
        this.id = id;
        this.productName = productName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) {
        this.productName = productName;
    }
}
