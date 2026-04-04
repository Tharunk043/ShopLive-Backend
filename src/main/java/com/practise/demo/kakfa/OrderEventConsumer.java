package com.practise.demo.kakfa;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class OrderEventConsumer {

    @KafkaListener(topics = "order-status-updated", groupId = "shoplive-group")
    public void consume(String message) {
        System.out.println("Received update: " + message);

        // Later we push to WebSocket here
    }
}
