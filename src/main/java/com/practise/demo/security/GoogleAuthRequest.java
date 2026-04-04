
package com.practise.demo.security;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String token;

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
