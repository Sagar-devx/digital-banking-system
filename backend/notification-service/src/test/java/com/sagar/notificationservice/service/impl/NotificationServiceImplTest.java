package com.sagar.notificationservice.service.impl;

import com.sagar.notificationservice.client.AccountClient;
import com.sagar.notificationservice.dto.AccountResponse;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private AccountClient accountClient;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(notificationService, "fromEmail", "noreply@digitalbanking.com");
    }

    private AccountResponse createSampleAccount(String accountNumber, String name, String email) {
        AccountResponse response = new AccountResponse();
        response.setAccountNumber(accountNumber);
        response.setAccountHolderName(name);
        response.setEmail(email);
        response.setBalance(new BigDecimal("10000"));
        return response;
    }

    @Test
    @DisplayName("Consume OTP generated and send verification email")
    void consumeOtpGenerated_Success() {
        String accountNumber = "AC-101";
        Map<String, Object> payload = new HashMap<>();
        payload.put("accountNumber", accountNumber);
        payload.put("otp", "123456");
        payload.put("amount", new BigDecimal("5000"));
        payload.put("reason", "Suspicious transaction amount");

        AccountResponse account = createSampleAccount(accountNumber, "Sagar", "sagar@gmail.com");
        when(accountClient.getAccount(accountNumber)).thenReturn(Optional.of(account));
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));

        notificationService.consumeOtpGenerated(payload);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Consume OTP generated skips when no email registered")
    void consumeOtpGenerated_NoEmail_Skips() {
        String accountNumber = "AC-101";
        Map<String, Object> payload = new HashMap<>();
        payload.put("accountNumber", accountNumber);
        payload.put("otp", "123456");
        payload.put("amount", new BigDecimal("5000"));
        payload.put("reason", "Suspicious transaction amount");

        AccountResponse account = createSampleAccount(accountNumber, "Sagar", null);
        when(accountClient.getAccount(accountNumber)).thenReturn(Optional.of(account));

        notificationService.consumeOtpGenerated(payload);

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Consume transaction completed sends debit and credit alerts")
    void consumeTransactionCompleted_Success() {
        String sender = "AC-101";
        String receiver = "AC-102";
        Map<String, Object> payload = new HashMap<>();
        payload.put("senderAccountNumber", sender);
        payload.put("receiverAccountNumber", receiver);
        payload.put("amount", new BigDecimal("3000"));

        AccountResponse senderAcc = createSampleAccount(sender, "Sagar", "sagar@gmail.com");
        AccountResponse receiverAcc = createSampleAccount(receiver, "Rahul", "rahul@gmail.com");

        when(accountClient.getAccount(sender)).thenReturn(Optional.of(senderAcc));
        when(accountClient.getAccount(receiver)).thenReturn(Optional.of(receiverAcc));
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));

        notificationService.consumeTransactionCompleted(payload);

        verify(mailSender, times(2)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Consume fraud detected sends alert email")
    void consumeFraudDetected_Success() {
        String accountNumber = "AC-101";
        Map<String, Object> payload = new HashMap<>();
        payload.put("accountNumber", accountNumber);
        payload.put("reason", "Wrong OTP attempts exceeded");

        AccountResponse account = createSampleAccount(accountNumber, "Sagar", "sagar@gmail.com");
        when(accountClient.getAccount(accountNumber)).thenReturn(Optional.of(account));
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));

        notificationService.consumeFraudDetected(payload);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Consume transaction refunded sends refund notification")
    void consumeTransactionRefunded_Success() {
        String accountNumber = "AC-101";
        Map<String, Object> payload = new HashMap<>();
        payload.put("senderAccountNumber", accountNumber);
        payload.put("amount", new BigDecimal("5000"));
        payload.put("reason", "OTP expired");

        AccountResponse account = createSampleAccount(accountNumber, "Sagar", "sagar@gmail.com");
        when(accountClient.getAccount(accountNumber)).thenReturn(Optional.of(account));
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));

        notificationService.consumeTransactionRefunded(payload);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Consume payment completed sends confirmation email")
    void consumePaymentCompleted_Success() {
        String accountNumber = "AC-101";
        Map<String, Object> payload = new HashMap<>();
        payload.put("accountNumber", accountNumber);
        payload.put("amount", new BigDecimal("1500"));
        payload.put("razorpayPaymentId", "pay_888999");

        AccountResponse account = createSampleAccount(accountNumber, "Sagar", "sagar@gmail.com");
        when(accountClient.getAccount(accountNumber)).thenReturn(Optional.of(account));
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));

        notificationService.consumePaymentCompleted(payload);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("Consume payment failed sends failure alert")
    void consumePaymentFailed_Success() {
        String accountNumber = "AC-101";
        Map<String, Object> payload = new HashMap<>();
        payload.put("accountNumber", accountNumber);
        payload.put("amount", new BigDecimal("1500"));

        AccountResponse account = createSampleAccount(accountNumber, "Sagar", "sagar@gmail.com");
        when(accountClient.getAccount(accountNumber)).thenReturn(Optional.of(account));
        when(mailSender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));

        notificationService.consumePaymentFailed(payload);

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }
}
