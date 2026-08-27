package com.sagar.paymentservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.RazorpayException;
import com.sagar.paymentservice.dto.CreatePaymentRequest;
import com.sagar.paymentservice.dto.PaymentOrderResponse;
import com.sagar.paymentservice.exception.GlobalExceptionHandler;
import com.sagar.paymentservice.exception.PaymentNotFoundException;
import com.sagar.paymentservice.service.PaymentService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(paymentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("Create payment order successfully returns 201 Created")
    void createPaymentOrder_Success() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setAccountNumber("AC-101");
        request.setAmount(new BigDecimal("500.00"));
        request.setDescription("Topup");

        PaymentOrderResponse response = new PaymentOrderResponse(
                "pay-101",
                "order_123",
                "500.00",
                "INR",
                "CREATED",
                "rzp_test_key"
        );

        when(paymentService.createPaymentOrder(any(CreatePaymentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/payments/create-order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.paymentId").value("pay-101"))
                .andExpect(jsonPath("$.razorpayOrderId").value("order_123"))
                .andExpect(jsonPath("$.status").value("CREATED"));
    }

    @Test
    @DisplayName("Create payment order throws RazorpayException returns 502 Bad Gateway")
    void createPaymentOrder_RazorpayException() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setAccountNumber("AC-101");
        request.setAmount(new BigDecimal("500.00"));
        request.setDescription("Topup");

        when(paymentService.createPaymentOrder(any(CreatePaymentRequest.class)))
                .thenThrow(new RazorpayException("Gateway timeout"));

        mockMvc.perform(post("/api/v1/payments/create-order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.status").value(502))
                .andExpect(jsonPath("$.error").value("Bad Gateway"))
                .andExpect(jsonPath("$.message").value("Razorpay gateway error: Gateway timeout"));
    }

    @Test
    @DisplayName("Create payment order validation failure returns 400 Bad Request")
    void createPaymentOrder_ValidationFailure() throws Exception {
        CreatePaymentRequest request = new CreatePaymentRequest();
        // Missing required fields

        mockMvc.perform(post("/api/v1/payments/create-order")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }
}
