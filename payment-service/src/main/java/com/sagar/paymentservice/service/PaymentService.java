package com.sagar.paymentservice.service;

import com.razorpay.RazorpayException;
import com.sagar.paymentservice.dto.CreatePaymentRequest;
import com.sagar.paymentservice.dto.PaymentOrderResponse;
import jakarta.validation.Valid;

import java.util.Map;

public interface PaymentService {
    
    PaymentOrderResponse createPaymentOrder(@Valid CreatePaymentRequest paymentRequest) throws RazorpayException;

    void handleWebhook(Map<String, Object> payload);
}
