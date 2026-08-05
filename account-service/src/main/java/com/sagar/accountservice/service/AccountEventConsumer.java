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

    /**
     * Consume transaction.ompleted event from kafka
     * credits receiver account
     * @param payload
     */
    @KafkaListener(topics ="transaction.completed")
    public void consumeTransactionComplete(
            @Payload Map<String,Object> payload){

        try{
            String receiverAccount = (String) payload.get("receiverAccountNumber");
            BigDecimal amount = new BigDecimal(payload.get("account").toString());

            log.info("creating account : {} amount : {}", receiverAccount, amount);

            accountService.creditBalance(receiverAccount, amount);
        }
        catch(Exception e){
            log.error("error while crediting account : {} ", e.getMessage());
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
            log.error("error while crediting account : {} ", e.getMessage());
        }
    }

    }
