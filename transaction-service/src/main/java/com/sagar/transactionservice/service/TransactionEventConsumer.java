package com.sagar.transactionservice.service;

import com.sagar.transactionservice.entity.Transaction;
import com.sagar.transactionservice.entity.TransactionStatus;
import com.sagar.transactionservice.repository.TransactionRepository;
import com.sagar.transactionservice.service.impl.TransactionServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionEventConsumer {

    private final TransactionRepository transactionRepository;
    private final TransactionServiceImpl transactionService;
    private final RedisTemplate<String, String> redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TRANSACTION_OTP_GENERATED_TOPIC = "transaction.otp.generated";

    private static final long OTP_EXPIRY_MINUTES = 5;

    /**
     * Consume the verification required event
     * Generate OTP and ask user to verify
     *
     * @param payload
     */
    @KafkaListener(topics = "verification.required")
    public void consumeVerificationRequired(
            @Payload Map<String, Object> payload) {

        try {
            String transactionId = (String) payload.get("transactionId");
            String accountNumber = (String) payload.get("accountNumber");
            String reason = (String) payload.get("reason");

            log.info("verification required - transaction: {} reason: {}", transactionId, reason);

            Transaction transaction = transactionRepository.findById(transactionId)
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            if (transaction.getStatus() != TransactionStatus.PROCESSING) {
                log.warn("Transaction {} is not in PROCESSING state, skipping", transactionId);
                return;
            }

            // Generate 6 digit OTP
            String otp = String.format("%06d", (int) (Math.random() * 900000) + 100000);

            //Store otp in Redis - expires in 5 minutes
            String otpKey = "transaction:otp:" + transactionId;
            redisTemplate.opsForValue().set(otpKey, otp, OTP_EXPIRY_MINUTES, TimeUnit.MINUTES);

            //update status

            transaction.setStatus(TransactionStatus.PENDING_VERIFICATION);
            transactionRepository.save(transaction);

            log.info("OTP generated for transaction {}: expires in {} minutes", transactionId, OTP_EXPIRY_MINUTES);

            //Notify user
            Map<String, Object> otpEvent = Map.of(
                    "transactionId", transactionId,
                    "accountNumber", accountNumber,
                    "otp", otp,
                    "reason", reason,
                    "amount", payload.get("amount")
            );

            kafkaTemplate.send(TRANSACTION_OTP_GENERATED_TOPIC, transactionId, otpEvent);
        } catch (Exception e) {
            log.error("Error processing verification required event: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "fraud.check.clean")
    public void consumeFraudCheckCleanResult(
            @Payload Map<String,Object> payload
    ){
        try{
            String transactionId = (String) payload.get("transactionId");
            transactionService.processCleanResult(transactionId);
        }
        catch (Exception e){
            log.error("Error processing fraud check clean result: {}", e.getMessage(), e);
        }

    }


}



