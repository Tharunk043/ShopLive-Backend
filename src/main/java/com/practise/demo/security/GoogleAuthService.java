package com.practise.demo.security;


import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthService {

    private final GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
            new NetHttpTransport(),
            new JacksonFactory()
    )
            .setAudience(Collections.singletonList(
                    "536027325649-l6ltjgtkasqokb9de3c72bi1hv3b1f63.apps.googleusercontent.com"
            ))
            .build();

    public GoogleIdToken.Payload verify(String token) throws Exception {
        GoogleIdToken idToken = verifier.verify(token);
        return idToken.getPayload();
    }
}
