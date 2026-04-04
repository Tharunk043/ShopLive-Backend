

package com.practise.demo.kakfa;

import com.practise.demo.DTO.OrderStatusUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class OrderStatusListener {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = "order-status-updated", groupId = "shoplive-group")
    public void listen(String message) {

        System.out.println("Received update: " + message);

        // message format: orderId:STATUS
        String[] parts = message.split(":");
        String orderId = parts[0];
        String status = parts[1];

        OrderStatusUpdate update = new OrderStatusUpdate(orderId, status);

        // 🔥 Push to WebSocket topic
        messagingTemplate.convertAndSend("/topic/order-status", update);
    }
}