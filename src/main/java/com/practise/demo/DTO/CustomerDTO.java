package com.practise.demo.DTO;


import java.io.Serializable;
import java.util.List;

public class CustomerDTO implements Serializable {
    private String id;
    private String name;
    private List<OrderDTO> orders;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<OrderDTO> getOrders() { return orders; }
    public void setOrders(List<OrderDTO> orders) { this.orders = orders; }
}
