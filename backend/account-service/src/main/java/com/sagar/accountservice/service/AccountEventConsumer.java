package com.sagar.accountservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountEventConsumer {

    private final AccountService accountService;

    // The transaction service credits the receiver synchronously before it publishes
    // this event. Keeping this listener side-effect free avoids duplicate credits.
    @KafkaListener(topics = "transaction.completed")
    public void consumeTransactionComplete(@Payload Map<String, Object> payload) {
        log.debug("Transaction completed event received for audit: {}", payload.get("transactionId"));
    }
    /**
     * Credits the account after Payment Service has confirmed a Razorpay payment.
     */
    @KafkaListener(topics = "payment.completed")
    public void consumePaymentCompleted(@Payload Map<String, Object> payload) {
        try {
            Object accountNumberValue = payload.get("accountNumber");
            Object amountValue = payload.get("amount");
            if (accountNumberValue == null || amountValue == null) {
                log.error("Ignoring payment.completed event with missing accountNumber or amount: {}", payload);
                return;
            }

            String accountNumber = String.valueOf(accountNumberValue);
            BigDecimal amount = new BigDecimal(String.valueOf(amountValue));
            if (amount.signum() <= 0) {
                log.error("Ignoring payment.completed event with non-positive amount: {}", payload);
                return;
            }

            accountService.creditBalance(accountNumber, amount);
            log.info("Payment credited to account {}: {}", accountNumber, amount);
        } catch (Exception e) {
            log.error("Error crediting account for payment.completed event: {}", e.getMessage(), e);
        }
    }
    /**
     * conume fraud.detected event from kafka
     * Blocks the flagged account
     * @param payload
     */
    @KafkaListener(topics = "fraud.detected")
    public void consumeFraudDetected(
            @Payload Map<String,Object> payload){
        try{
            String accountNumber = (String) payload.get("accountNumber");
            log.info("Fraud detected - blocking account : {} ", accountNumber);

            accountService.blockAccount(accountNumber);
        }
        catch(Exception e){
            log.error("error while blocking account: {}", e.getMessage(), e);
        }
    }

    }
