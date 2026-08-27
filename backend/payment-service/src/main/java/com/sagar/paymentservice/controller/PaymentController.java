package com.sagar.paymentservice.controller;

import com.razorpay.RazorpayException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sagar.paymentservice.config.PaymentWebhookVerifier;
import com.sagar.paymentservice.dto.CreatePaymentRequest;
import com.sagar.paymentservice.dto.ConfirmPaymentRequest;
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
    private final PaymentWebhookVerifier paymentWebhookVerifier;

    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(
            @Valid @RequestBody CreatePaymentRequest paymentRequest) throws RazorpayException {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPaymentOrder(paymentRequest));
    }

    @PostMapping("/confirm")
    public ResponseEntity<String> confirmPayment(@Valid @RequestBody ConfirmPaymentRequest request) {
        paymentService.confirmPayment(request);
        return ResponseEntity.ok("payment confirmed");
    }
    //Razorpay webhook

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) throws Exception {
        paymentWebhookVerifier.verify(payload, signature);
        paymentService.handleWebhook(new ObjectMapper().readValue(payload, new TypeReference<Map<String, Object>>() {}));
        return ResponseEntity.ok("webhook processed");
    }
}