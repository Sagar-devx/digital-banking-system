package com.sagar.transactionservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sagar.transactionservice.dto.TransactionRequest;
import com.sagar.transactionservice.dto.TransactionResponse;
import com.sagar.transactionservice.entity.TransactionStatus;
import com.sagar.transactionservice.entity.TransactionType;
import com.sagar.transactionservice.exception.GlobalExceptionHandler;
import com.sagar.transactionservice.exception.InvalidTransactionException;
import com.sagar.transactionservice.exception.TransactionNotFoundException;
import com.sagar.transactionservice.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private TransactionService transactionService;

    @InjectMocks
    private TransactionController transactionController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(transactionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Transfer returns 201 Created on success")
    void transfer_Success() throws Exception {
        TransactionRequest request = new TransactionRequest();
        request.setSenderAccountNumber("AC-101");
        request.setReceiverAccountNumber("AC-102");
        request.setAmount(new BigDecimal("5000"));
        request.setDescription("Test transfer");

        TransactionResponse response = TransactionResponse.builder()
                .id("tx-101")
                .senderAccountNumber("AC-101")
                .receiverAccountNumber("AC-102")
                .amount(new BigDecimal("5000"))
                .status(TransactionStatus.PROCESSING)
                .type(TransactionType.TRANSFER)
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionService.transfer(any(TransactionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("tx-101"))
                .andExpect(jsonPath("$.senderAccountNumber").value("AC-101"))
                .andExpect(jsonPath("$.amount").value(5000));
    }

    @Test
    @DisplayName("Transfer without description succeeds with 201 Created")
    void transfer_WithoutDescription_Success() throws Exception {
        TransactionRequest request = new TransactionRequest();
        request.setSenderAccountNumber("AC-101");
        request.setReceiverAccountNumber("AC-102");
        request.setAmount(new BigDecimal("5000"));
        // description is null/optional

        TransactionResponse response = TransactionResponse.builder()
                .id("tx-102")
                .senderAccountNumber("AC-101")
                .receiverAccountNumber("AC-102")
                .amount(new BigDecimal("5000"))
                .status(TransactionStatus.PROCESSING)
                .type(TransactionType.TRANSFER)
                .description("Transfer")
                .createdAt(LocalDateTime.now())
                .build();

        when(transactionService.transfer(any(TransactionRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("tx-102"))
                .andExpect(jsonPath("$.senderAccountNumber").value("AC-101"))
                .andExpect(jsonPath("$.amount").value(5000));
    }

    @Test
    @DisplayName("Transfer throws InvalidTransactionException returns 400 Bad Request")
    void transfer_InvalidTransaction() throws Exception {
        TransactionRequest request = new TransactionRequest();
        request.setSenderAccountNumber("AC-101");
        request.setReceiverAccountNumber("AC-101");
        request.setAmount(new BigDecimal("5000"));
        request.setDescription("Self transfer");

        when(transactionService.transfer(any(TransactionRequest.class)))
                .thenThrow(new InvalidTransactionException("Sender and receiver account numbers cannot be identical"));

        mockMvc.perform(post("/api/v1/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Sender and receiver account numbers cannot be identical"));
    }

    @Test
    @DisplayName("Transfer validation failure returns 400 Bad Request with validation errors")
    void transfer_ValidationFailure() throws Exception {
        TransactionRequest request = new TransactionRequest();
        // Missing required fields

        mockMvc.perform(post("/api/v1/transactions/transfer")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("Get transaction not found returns 404 Not Found")
    void getTransaction_NotFound() throws Exception {
        when(transactionService.getTransaction("tx-999"))
                .thenThrow(new TransactionNotFoundException("Transaction not found with ID: tx-999"));

        mockMvc.perform(get("/api/v1/transactions/tx-999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Transaction not found with ID: tx-999"));
    }

    @Test
    @DisplayName("Verify OTP returns 200 OK")
    void verifyOTP_Success() throws Exception {
        TransactionResponse response = TransactionResponse.builder()
                .id("tx-101")
                .senderAccountNumber("AC-101")
                .receiverAccountNumber("AC-102")
                .amount(new BigDecimal("5000"))
                .status(TransactionStatus.COMPLETED)
                .type(TransactionType.TRANSFER)
                .build();

        when(transactionService.verifyOTP(eq("tx-101"), eq("123456"))).thenReturn(response);

        mockMvc.perform(post("/api/v1/transactions/tx-101/verify?otp=123456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }
}
