package com.sagar.paymentservice.controller;

import com.razorpay.RazorpayException;
import com.sagar.paymentservice.dto.CreatePaymentRequest;
import com.sagar.paymentservice.dto.PaymentOrderResponse;
import com.sagar.paymentservice.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(
            @Valid @RequestBody CreatePaymentRequest paymentRequest) throws RazorpayException {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPaymentOrder(paymentRequest));
    }

    //Razorpay webhook

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody Map<String, Object> payload) {

        paymentService.handleWebhook(payload);
        return ResponseEntity.status(HttpStatus.OK).body("webhook processed");
    }
}
