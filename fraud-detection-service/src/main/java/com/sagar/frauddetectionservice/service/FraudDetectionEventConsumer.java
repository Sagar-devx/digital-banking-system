package com.sagar.frauddetectionservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FraudDetectionEventConsumer {

    private final FraudDetectionService fraudDetectionService;

    /**
     * Listener to transaction initiated topic
     * Every transaction goes through fraud check before completing
     * @param payload
     */
    @KafkaListener(topics = "transaction.initiated",groupId = "fraud-detection-group")
    public void consumeTransactionInitiated(
            @Payload Map<String,Object> payload){

        log.info("Consuming transaction initiated event for fraud checking: {}", payload);

        try{
            fraudDetectionService.checkTransaction(payload);
        }
        catch(Exception e){

        }

    }
}
