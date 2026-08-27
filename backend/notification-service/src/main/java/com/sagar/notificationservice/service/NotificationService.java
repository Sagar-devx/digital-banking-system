package com.sagar.notificationservice.service;

import org.springframework.messaging.handler.annotation.Payload;

import java.util.Map;

public interface NotificationService {

    void consumeOtpGenerated(
            @Payload Map<String,Object> payload);

    }
