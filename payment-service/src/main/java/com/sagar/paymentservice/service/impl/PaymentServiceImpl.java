package com.sagar.paymentservice.service.impl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.sagar.paymentservice.dto.CreatePaymentRequest;
import com.sagar.paymentservice.dto.PaymentOrderResponse;
import com.sagar.paymentservice.entity.Payment;
import com.sagar.paymentservice.entity.PaymentStatus;
import com.sagar.paymentservice.repository.PaymentRepository;
import com.sagar.paymentservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
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
    private final KafkaTemplate<String, Object> kafkaTemplate;

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

    private void handlePaymentFailure(Map<String, Object> payload) {

        try{
            Map<String, Object> paymentData = extractPaymentData(payload);

            String orderId = (String) paymentData.get("order_id");

            Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment record not found for orderId: " + orderId));

            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Payment failed via Razorpay");
            paymentRepository.save(payment);

            //Publish payment failed event to Kafka
            Map<String, Object> eventPayload = Map.of(
                    "paymentId", payment.getId(),
                    "accountNumber", payment.getAccountNumber(),
                    "amount", payment.getAmount(),
                    "reason", "Payment failed via Razorpay"
            );

            kafkaTemplate.send(PAYMENT_FAILED_TOPIC,payment.getId(), eventPayload);
            log.info("Payment failed: {}",payment.getId());

        } catch (Exception e) {

            log.error("Error handling payment failure webhook: {}", e.getMessage(), e);
        }
    }

    private void handlePaymentSuccess(Map<String, Object> payload) {

        try{
            Map<String, Object> paymentData = extractPaymentData(payload);
            String orderId = (String) paymentData.get("order_id");
            String paymentId = (String) paymentData.get("id");

            Payment payment = paymentRepository.findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment record not found for orderId: " + orderId));

            payment.setRazorpayPaymentId(paymentId);
            payment.setStatus(PaymentStatus.COMPLETED);
            paymentRepository.save(payment);

            //Publish payment completed event to Kafka
            Map<String, Object> eventPayload = Map.of(
                    "paymentId", payment.getId(),
                    "accountNumber", payment.getAccountNumber(),
                    "amount", payment.getAmount(),
                    "razorpayPaymentId", payment.getRazorpayPaymentId()
            );

            kafkaTemplate.send(PAYMENT_COMPLETED_TOPIC,payment.getId(), eventPayload);
            log.info("Payment completed: {}",payment.getId());

        } catch (Exception e) {

            log.error("Error handling payment success webhook: {}", e.getMessage(), e);
        }
    }

    private Map<String, Object> extractPaymentData(Map<String, Object> payload) {

        Map<String, Object> paymentEntity = (Map<String, Object>) payload.get("payload");
        Map<String, Object> paymentWrapper = (Map<String, Object>) paymentEntity.get("payment");

        return (Map<String, Object>) paymentWrapper.get("entity");

    }
}


