package com.semesterx.semesterxbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GoogleProperties {

    @Value("${google.client.id}")
    private String clientId;

    public String getClientId() {
        return clientId;
    }
}