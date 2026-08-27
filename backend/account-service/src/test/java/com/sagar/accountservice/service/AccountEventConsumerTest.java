package com.sagar.accountservice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountEventConsumerTest {

    @Mock
    private AccountService accountService;

    @InjectMocks
    private AccountEventConsumer consumer;

    @Test
    void paymentCompleted_CreditsAccount() {
        consumer.consumePaymentCompleted(Map.of("accountNumber", "123456789012", "amount", "250.50"));

        verify(accountService).creditBalance("123456789012", new BigDecimal("250.50"));
    }

    @Test
    void paymentCompleted_IgnoresInvalidAmount() {
        consumer.consumePaymentCompleted(Map.of("accountNumber", "123456789012", "amount", "0"));

        verifyNoInteractions(accountService);
    }
}