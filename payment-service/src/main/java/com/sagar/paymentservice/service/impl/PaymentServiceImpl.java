package com.sagar.paymentservice.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.sagar.paymentservice.dto.CreatePaymentRequest;
import com.sagar.paymentservice.dto.PaymentOrderResponse;
import com.sagar.paymentservice.entity.Payment;
import com.sagar.paymentservice.repository.PaymentRepository;
import com.sagar.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    @Value("${razorpay.key-Id}")
    private String keyId;

    @Value("${razorpay.key-Secret}")
    private String keySecret;

    private final PaymentRepository paymentRepository;

    private static final String PAYMENT_COMPLETED_TOPIC = "payment.completed";
    private static final String PAYMENT_FAILED_TOPIC = "payment.failed";

    @Override
    public PaymentOrderResponse createPaymentOrder(CreatePaymentRequest paymentRequest) throws RazorpayException {

        log.info("create payment order for acccount: {} amount: {}",
                paymentRequest.getAccountNumber(), paymentRequest.getAmount());

        RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

        //Converted Amount
        int convertedAmount = paymentRequest.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .intValue();

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", convertedAmount);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis() + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 10));

        Order razorpayOrder = razorpayClient.orders.create(orderRequest);

        log.info("Payment order created: {}", razorpayOrder.get("id").toString());

        //Save payment record
        Payment payment = new Payment();
        payment.setRazorpayOrderId(razorpayOrder.get("id").toString());
        payment.setAccountNumber(paymentRequest.getAccountNumber());
        payment.setAmount(BigDecimal.valueOf(convertedAmount));
        payment.setCurrency("INR");
        payment.setDescription(paymentRequest.getDescription());
        payment.setDescription(paymentRequest.getDescription());

        Payment savedPayment = paymentRepository.save(payment);

        return new PaymentOrderResponse(
                savedPayment.getId(),
                razorpayOrder.get("id").toString(),
                paymentRequest.getAmount().toString(),
                "INR",
                "CREATED",
                keyId
        );
    }

    @Override
    public void handleWebhook(Map<String, Object> payload) {

        log.info("Received Razorpay webhook: {}", payload.get("event"));

        String event =  (String) payload.get("event");

        if("payment.captured".equals(event)) {

            handlePaymentSuccess(payload);
        }
        else if("payment.failed".equals(event)) {

            handlePaymentFailure(payload);
        }
    }

    private void handlePaymentSuccess(Map<String, Object> payload) {

        try{
            Map<String, Object> paymentEntity = (Map<String, Object>) payload.get("payload");
        }
    }

}


