package com.practise.demo.kakfa;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderEventProducer {

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    public void sendStatusUpdate(String orderId, String status) {
        String message = orderId + ":" + status;
        kafkaTemplate.send("order-status-updated", message);
        kafkaTemplate.flush();
    }
}
