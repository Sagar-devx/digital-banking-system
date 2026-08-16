package com.sagar.frauddetectionservice.service.impl;

import com.sagar.frauddetectionservice.client.AccountServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FraudDetectionServiceImplTest {

    @Mock
    private AccountServiceClient accountServiceClient;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private FraudDetectionServiceImpl fraudDetectionService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(fraudDetectionService, "maxTransactionPerMinute", 5);
        ReflectionTestUtils.setField(fraudDetectionService, "suspiciousAmountMultiplier", 5.0);
        ReflectionTestUtils.setField(fraudDetectionService, "maxBalancePercentage", 0.90);
    }

    private Map<String, Object> createSamplePayload(String transactionId, String accountNumber, BigDecimal amount) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("transactionId", transactionId);
        payload.put("senderAccountNumber", accountNumber);
        payload.put("amount", amount);
        payload.put("description", "Payment transfer");
        return payload;
    }

    @Test
    @DisplayName("Check transaction is clean")
    void checkTransaction_Clean() {
        String transactionId = "tx-101";
        String accountNumber = "AC-1001";
        BigDecimal amount = new BigDecimal("1000");
        BigDecimal balance = new BigDecimal("10000");

        Map<String, Object> payload = createSamplePayload(transactionId, accountNumber, amount);

        when(accountServiceClient.getBalance(accountNumber)).thenReturn(balance);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("fraud:velocity:" + accountNumber)).thenReturn(1L);
        when(valueOperations.get("fraud:avg_amount:" + accountNumber)).thenReturn("1000");

        fraudDetectionService.checkTransaction(payload);

        verify(kafkaTemplate, times(1)).send(eq("fraud.check.clean"), eq(transactionId), anyMap());
        verify(kafkaTemplate, never()).send(eq("verification.required"), anyString(), any());
    }

    @Test
    @DisplayName("Check transaction when velocity limit exceeded")
    void checkTransaction_VelocityExceeded() {
        String transactionId = "tx-102";
        String accountNumber = "AC-1002";
        BigDecimal amount = new BigDecimal("500");
        BigDecimal balance = new BigDecimal("10000");

        Map<String, Object> payload = createSamplePayload(transactionId, accountNumber, amount);

        when(accountServiceClient.getBalance(accountNumber)).thenReturn(balance);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("fraud:velocity:" + accountNumber)).thenReturn(6L);

        fraudDetectionService.checkTransaction(payload);

        verify(kafkaTemplate, times(1)).send(eq("verification.required"), eq(transactionId), anyMap());
        verify(kafkaTemplate, never()).send(eq("fraud.check.clean"), anyString(), any());
    }

    @Test
    @DisplayName("Set expiry on first velocity increment")
    void checkTransaction_SetVelocityExpiry() {
        String transactionId = "tx-103";
        String accountNumber = "AC-1003";
        BigDecimal amount = new BigDecimal("500");
        BigDecimal balance = new BigDecimal("10000");

        Map<String, Object> payload = createSamplePayload(transactionId, accountNumber, amount);

        when(accountServiceClient.getBalance(accountNumber)).thenReturn(balance);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("fraud:velocity:" + accountNumber)).thenReturn(1L);
        when(valueOperations.get("fraud:avg_amount:" + accountNumber)).thenReturn(null);

        fraudDetectionService.checkTransaction(payload);

        verify(redisTemplate, times(1)).expire(eq("fraud:velocity:" + accountNumber), eq(60L), eq(TimeUnit.SECONDS));
    }

    @Test
    @DisplayName("Check transaction when amount exceeds 5x average")
    void checkTransaction_SuspiciousAmount() {
        String transactionId = "tx-104";
        String accountNumber = "AC-1004";
        BigDecimal amount = new BigDecimal("6000");
        BigDecimal balance = new BigDecimal("50000");

        Map<String, Object> payload = createSamplePayload(transactionId, accountNumber, amount);

        when(accountServiceClient.getBalance(accountNumber)).thenReturn(balance);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("fraud:velocity:" + accountNumber)).thenReturn(2L);
        when(valueOperations.get("fraud:avg_amount:" + accountNumber)).thenReturn("1000");

        fraudDetectionService.checkTransaction(payload);

        verify(kafkaTemplate, times(1)).send(eq("verification.required"), eq(transactionId), anyMap());
        verify(kafkaTemplate, never()).send(eq("fraud.check.clean"), anyString(), any());
    }

    @Test
    @DisplayName("Initialize average when no history in Redis")
    void checkTransaction_InitialAverage() {
        String transactionId = "tx-105";
        String accountNumber = "AC-1005";
        BigDecimal amount = new BigDecimal("1000");
        BigDecimal balance = new BigDecimal("10000");

        Map<String, Object> payload = createSamplePayload(transactionId, accountNumber, amount);

        when(accountServiceClient.getBalance(accountNumber)).thenReturn(balance);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("fraud:velocity:" + accountNumber)).thenReturn(1L);
        when(valueOperations.get("fraud:avg_amount:" + accountNumber)).thenReturn(null);

        fraudDetectionService.checkTransaction(payload);

        verify(valueOperations, times(1)).set(eq("fraud:avg_amount:" + accountNumber), eq("1000"));
        verify(kafkaTemplate, times(1)).send(eq("fraud.check.clean"), eq(transactionId), anyMap());
    }

    @Test
    @DisplayName("Check transaction when amount exceeds 90% of balance")
    void checkTransaction_BalanceExceeded() {
        String transactionId = "tx-106";
        String accountNumber = "AC-1006";
        BigDecimal amount = new BigDecimal("9500");
        BigDecimal balance = new BigDecimal("10000");

        Map<String, Object> payload = createSamplePayload(transactionId, accountNumber, amount);

        when(accountServiceClient.getBalance(accountNumber)).thenReturn(balance);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.increment("fraud:velocity:" + accountNumber)).thenReturn(1L);
        when(valueOperations.get("fraud:avg_amount:" + accountNumber)).thenReturn(null);

        fraudDetectionService.checkTransaction(payload);

        verify(kafkaTemplate, times(1)).send(eq("verification.required"), eq(transactionId), anyMap());
        verify(kafkaTemplate, never()).send(eq("fraud.check.clean"), anyString(), any());
    }
}
