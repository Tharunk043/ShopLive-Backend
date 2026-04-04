package com.practise.demo.rt;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class OrderRateLimiter {

    private static final int MAX_ORDERS = 3;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final StringRedisTemplate redisTemplate;

    public OrderRateLimiter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean allowOrder(String userId) {
        String key = "rate:order:" + userId;

        Long count = redisTemplate.opsForValue().increment(key);

        // First request → set TTL
        if (count != null && count == 1) {
            redisTemplate.expire(key, WINDOW);
        }

        return count != null && count <= MAX_ORDERS;
    }
}
