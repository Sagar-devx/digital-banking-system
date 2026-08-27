package com.sagar.transactionservice.service.impl;

import com.sagar.transactionservice.client.AccountServiceClient;
import com.sagar.transactionservice.dto.TransactionRequest;
import com.sagar.transactionservice.dto.TransactionResponse;
import com.sagar.transactionservice.entity.Transaction;
import com.sagar.transactionservice.entity.TransactionStatus;
import com.sagar.transactionservice.entity.TransactionType;
import com.sagar.transactionservice.event.TransactionCompletedEvent;
import com.sagar.transactionservice.event.TransactionInitiatedEvent;
import com.sagar.transactionservice.exception.AccountOperationFailedException;
import com.sagar.transactionservice.exception.InvalidTransactionException;
import com.sagar.transactionservice.exception.TransactionNotFoundException;
import com.sagar.transactionservice.repository.TransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private AccountServiceClient accountServiceClient;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private TransactionServiceImpl transactionService;

    private Transaction createSampleTransaction(String id, String sender, String receiver, BigDecimal amount, TransactionStatus status) {
        Transaction tx = new Transaction();
        tx.setId(id);
        tx.setSenderAccountNumber(sender);
        tx.setReceiverAccountNumber(receiver);
        tx.setAmount(amount);
        tx.setStatus(status);
        tx.setType(TransactionType.TRANSFER);
        tx.setDescription("Test transfer");
        tx.setReferenceNumber(UUID.randomUUID().toString());
        tx.setCreatedAt(LocalDateTime.now());
        return tx;
    }

    @Test
    @DisplayName("Transfer initiated successfully")
    void transfer_Success() {
        TransactionRequest request = new TransactionRequest();
        request.setSenderAccountNumber("AC-101");
        request.setReceiverAccountNumber("AC-102");
        request.setAmount(new BigDecimal("5000"));
        request.setDescription("Test transfer");

        Transaction savedTx = createSampleTransaction("tx-999", "AC-101", "AC-102", new BigDecimal("5000"), TransactionStatus.PROCESSING);

        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);

        TransactionResponse response = transactionService.transfer(request);

        assertNotNull(response);
        assertEquals("tx-999", response.getId());
        assertEquals(TransactionStatus.PROCESSING, response.getStatus());
        assertEquals("AC-101", response.getSenderAccountNumber());
        assertEquals(new BigDecimal("5000"), response.getAmount());

        verify(accountServiceClient, times(1)).deductBalance(eq("AC-101"), eq(new BigDecimal("5000")));
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(kafkaTemplate, times(1)).send(eq("transaction.initiated"), eq("tx-999"), any(TransactionInitiatedEvent.class));
    }

    @Test
    @DisplayName("Transfer initiated successfully with null description defaults to Transfer")
    void transfer_NullDescription_Success() {
        TransactionRequest request = new TransactionRequest();
        request.setSenderAccountNumber("AC-101");
        request.setReceiverAccountNumber("AC-102");
        request.setAmount(new BigDecimal("5000"));
        request.setDescription(null);

        Transaction savedTx = createSampleTransaction("tx-999", "AC-101", "AC-102", new BigDecimal("5000"), TransactionStatus.PROCESSING);
        savedTx.setDescription("Transfer");

        when(transactionRepository.save(any(Transaction.class))).thenReturn(savedTx);

        TransactionResponse response = transactionService.transfer(request);

        assertNotNull(response);
        assertEquals("Transfer", response.getDescription());
        verify(accountServiceClient, times(1)).deductBalance(eq("AC-101"), eq(new BigDecimal("5000")));
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Transfer fails when sender and receiver account numbers are identical")
    void transfer_SameSenderAndReceiver() {
        TransactionRequest request = new TransactionRequest();
        request.setSenderAccountNumber("AC-101");
        request.setReceiverAccountNumber("AC-101");
        request.setAmount(new BigDecimal("5000"));

        InvalidTransactionException ex = assertThrows(InvalidTransactionException.class, () -> transactionService.transfer(request));
        assertEquals("Sender and receiver account numbers cannot be identical", ex.getMessage());
        verifyNoInteractions(accountServiceClient);
        verifyNoInteractions(transactionRepository);
    }

    @Test
    @DisplayName("Transfer fails before debit when recipient account is missing")
    void transfer_RecipientNotFound() {
        TransactionRequest request = new TransactionRequest("AC-101", "AC-999", new BigDecimal("5000"), null);
        doThrow(new RuntimeException("Account not found")).when(accountServiceClient).validateAccount("AC-999");

        InvalidTransactionException exception = assertThrows(InvalidTransactionException.class,
                () -> transactionService.transfer(request));

        assertEquals("Recipient account was not found or is unavailable", exception.getMessage());
        verify(accountServiceClient, never()).deductBalance(anyString(), any(BigDecimal.class));
        verifyNoInteractions(transactionRepository, kafkaTemplate);
    }
    @Test
    @DisplayName("Transfer fails when balance deduction fails")
    void transfer_DeductFailed() {
        TransactionRequest request = new TransactionRequest();
        request.setSenderAccountNumber("AC-101");
        request.setReceiverAccountNumber("AC-102");
        request.setAmount(new BigDecimal("5000"));

        doThrow(new RuntimeException("Insufficient funds")).when(accountServiceClient).deductBalance(anyString(), any(BigDecimal.class));

        AccountOperationFailedException exception = assertThrows(AccountOperationFailedException.class, () -> transactionService.transfer(request));

        assertEquals("Insufficient funds", exception.getMessage());
        verify(transactionRepository, never()).save(any(Transaction.class));
        verifyNoInteractions(kafkaTemplate);
    }

    @Test
    @DisplayName("Get transaction by ID")
    void getTransaction_Success() {
        String txId = "tx-101";
        Transaction tx = createSampleTransaction(txId, "AC-101", "AC-102", new BigDecimal("5000"), TransactionStatus.PROCESSING);

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));

        TransactionResponse response = transactionService.getTransaction(txId);

        assertNotNull(response);
        assertEquals(txId, response.getId());
        assertEquals("AC-101", response.getSenderAccountNumber());
        assertEquals(new BigDecimal("5000"), response.getAmount());
    }

    @Test
    @DisplayName("Get transaction throws TransactionNotFoundException when not found")
    void getTransaction_NotFound() {
        when(transactionRepository.findById("tx-999")).thenReturn(Optional.empty());

        TransactionNotFoundException ex = assertThrows(TransactionNotFoundException.class, () -> transactionService.getTransaction("tx-999"));
        assertEquals("Transaction not found with ID: tx-999", ex.getMessage());
    }

    @Test
    @DisplayName("Get transaction history by account number")
    void getTransactionHistory_Success() {
        String account = "AC-101";
        Transaction tx1 = createSampleTransaction("tx-1", account, "AC-102", new BigDecimal("1000"), TransactionStatus.COMPLETED);
        Transaction tx2 = createSampleTransaction("tx-2", account, "AC-103", new BigDecimal("2000"), TransactionStatus.COMPLETED);

        when(transactionRepository.findBySenderAccountNumberOrReceiverAccountNumberOrderByCreatedAtDesc(account, account)).thenReturn(List.of(tx1, tx2));

        List<TransactionResponse> history = transactionService.getTransactionHistory(account);

        assertNotNull(history);
        assertEquals(2, history.size());
        assertEquals("tx-1", history.get(0).getId());
        assertEquals("tx-2", history.get(1).getId());
    }

    @Test
    @DisplayName("Verify OTP successfully and completes transaction")
    void verifyOTP_Success() {
        String txId = "tx-999";
        String otp = "234567";
        Transaction tx = createSampleTransaction(txId, "AC-101", "AC-102", new BigDecimal("5000"), TransactionStatus.PROCESSING);

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(otp);

        TransactionResponse response = transactionService.verifyOTP(txId, otp);

        assertNotNull(response);
        assertEquals(TransactionStatus.COMPLETED, response.getStatus());

        verify(redisTemplate, times(1)).delete(anyString());
        verify(transactionRepository, times(1)).save(tx);
        verify(kafkaTemplate, times(1)).send(eq("transaction.completed"), eq(txId), any(TransactionCompletedEvent.class));
    }

    @Test
    @DisplayName("Verify OTP expired - compensates and refunds money")
    void verifyOTP_Expired() {
        String txId = "tx-999";
        Transaction tx = createSampleTransaction(txId, "AC-101", "AC-102", new BigDecimal("5000"), TransactionStatus.PROCESSING);

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);

        TransactionResponse response = transactionService.verifyOTP(txId, "123456");

        assertNotNull(response);
        assertEquals(TransactionStatus.FLAGGED, response.getStatus());

        verify(accountServiceClient, times(1)).creditBalance(eq("AC-101"), eq(new BigDecimal("5000")));
        verify(transactionRepository, times(1)).save(tx);
        verify(kafkaTemplate, times(1)).send(eq("transaction.refunded"), eq(txId), any());
    }

    @Test
    @DisplayName("Verify OTP wrong - blocks account and refunds")
    void verifyOTP_WrongOtp() {
        String txId = "tx-999";
        Transaction tx = createSampleTransaction(txId, "AC-101", "AC-102", new BigDecimal("5000"), TransactionStatus.PROCESSING);

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn("123456");

        TransactionResponse response = transactionService.verifyOTP(txId, "999999");

        assertNotNull(response);
        assertEquals(TransactionStatus.FLAGGED, response.getStatus());

        verify(redisTemplate, times(1)).delete(anyString());
        verify(accountServiceClient, times(1)).creditBalance(eq("AC-101"), eq(new BigDecimal("5000")));
        verify(transactionRepository, times(1)).save(tx);
        verify(kafkaTemplate, times(1)).send(eq("fraud.detected"), eq("AC-101"), any());
        verify(kafkaTemplate, times(1)).send(eq("transaction.refunded"), eq(txId), any());
    }

    @Test
    @DisplayName("Verify OTP throws TransactionNotFoundException when transaction not found")
    void verifyOTP_NotFound() {
        when(transactionRepository.findById("tx-999")).thenReturn(Optional.empty());

        TransactionNotFoundException ex = assertThrows(TransactionNotFoundException.class, () -> transactionService.verifyOTP("tx-999", "123456"));
        assertEquals("Transaction not found with ID: tx-999", ex.getMessage());
    }

    @Test
    @DisplayName("Process clean result completes transaction")
    void processCleanResult_Success() {
        String txId = "tx-101";
        Transaction tx = createSampleTransaction(txId, "AC-101", "AC-102", new BigDecimal("5000"), TransactionStatus.PROCESSING);

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));

        transactionService.processCleanResult(txId);

        assertEquals(TransactionStatus.COMPLETED, tx.getStatus());
        assertNotNull(tx.getCompletedAt());
        verify(transactionRepository, times(1)).save(tx);
        verify(kafkaTemplate, times(1)).send(eq("transaction.completed"), eq(txId), any(TransactionCompletedEvent.class));
    }

    @Test
    @DisplayName("Process clean result skips when status is not PROCESSING")
    void processCleanResult_NotProcessing() {
        String txId = "tx-101";
        Transaction tx = createSampleTransaction(txId, "AC-101", "AC-102", new BigDecimal("5000"), TransactionStatus.COMPLETED);

        when(transactionRepository.findById(txId)).thenReturn(Optional.of(tx));

        transactionService.processCleanResult(txId);

        verify(transactionRepository, never()).save(any(Transaction.class));
        verifyNoInteractions(kafkaTemplate);
    }

    @Test
    @DisplayName("Process clean result throws TransactionNotFoundException when transaction not found")
    void processCleanResult_NotFound() {
        when(transactionRepository.findById("tx-999")).thenReturn(Optional.empty());

        TransactionNotFoundException ex = assertThrows(TransactionNotFoundException.class, () -> transactionService.processCleanResult("tx-999"));
        assertEquals("Transaction not found with ID: tx-999", ex.getMessage());
    }
}