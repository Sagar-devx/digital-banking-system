package com.sagar.paymentservice.service.impl;

import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.sagar.paymentservice.dto.CreatePaymentRequest;
import com.sagar.paymentservice.dto.PaymentOrderResponse;
import com.sagar.paymentservice.entity.Payment;
import com.sagar.paymentservice.entity.PaymentStatus;
import com.sagar.paymentservice.repository.PaymentRepository;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedConstruction;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "keyId", "rzp_test_key");
        ReflectionTestUtils.setField(paymentService, "keySecret", "rzp_test_secret");
    }

    private Map<String, Object> createWebhookPayload(String event, String orderId, String paymentId) {
        Map<String, Object> entity = new HashMap<>();
        entity.put("order_id", orderId);
        entity.put("id", paymentId);

        Map<String, Object> paymentWrapper = new HashMap<>();
        paymentWrapper.put("entity", entity);

        Map<String, Object> payloadWrapper = new HashMap<>();
        payloadWrapper.put("payment", paymentWrapper);

        Map<String, Object> webhookPayload = new HashMap<>();
        webhookPayload.put("event", event);
        webhookPayload.put("payload", payloadWrapper);

        return webhookPayload;
    }

    @Test
    @DisplayName("Create payment order successfully")
    void createPaymentOrder_Success() throws RazorpayException {
        CreatePaymentRequest request = new CreatePaymentRequest();
        request.setAccountNumber("AC-101");
        request.setAmount(new BigDecimal("500.00"));
        request.setDescription("Wallet Topup");

        JSONObject orderJson = new JSONObject();
        orderJson.put("id", "order_123456");

        Order order = new Order(orderJson);
        OrderClient orderClient = mock(OrderClient.class);
        when(orderClient.create(any(JSONObject.class))).thenReturn(order);

        try (MockedConstruction<RazorpayClient> mocked = mockConstruction(RazorpayClient.class,
                (mock, context) -> mock.orders = orderClient)) {

            Payment savedPayment = new Payment();
            savedPayment.setId("pay-101");
            savedPayment.setRazorpayOrderId("order_123456");
            savedPayment.setAccountNumber("AC-101");
            savedPayment.setAmount(new BigDecimal("500.00"));

            when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);

            PaymentOrderResponse response = paymentService.createPaymentOrder(request);

            assertNotNull(response);
            assertEquals("order_123456", response.getRazorpayOrderId());
            assertEquals("pay-101", response.getPaymentId());
            assertEquals("500.00", response.getAmount());
            assertEquals("CREATED", response.getStatus());

            verify(paymentRepository, times(1)).save(any(Payment.class));
        }
    }

    @Test
    @DisplayName("Handle payment captured webhook successfully")
    void handleWebhook_PaymentCaptured() {
        String orderId = "order_123456";
        String razorpayPaymentId = "pay_987654";
        Map<String, Object> webhookPayload = createWebhookPayload("payment.captured", orderId, razorpayPaymentId);

        Payment payment = new Payment();
        payment.setId("pay-101");
        payment.setRazorpayOrderId(orderId);
        payment.setAccountNumber("AC-101");
        payment.setAmount(new BigDecimal("500.00"));
        payment.setStatus(PaymentStatus.PENDING);

        when(paymentRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(payment));

        paymentService.handleWebhook(webhookPayload);

        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        assertEquals(razorpayPaymentId, payment.getRazorpayPaymentId());
        verify(paymentRepository, times(1)).save(payment);
        verify(kafkaTemplate, times(1)).send(eq("payment.completed"), eq("pay-101"), anyMap());
    }

    @Test
    @DisplayName("Handle payment failed webhook successfully")
    void handleWebhook_PaymentFailed() {
        String orderId = "order_123456";
        String razorpayPaymentId = "pay_987654";
        Map<String, Object> webhookPayload = createWebhookPayload("payment.failed", orderId, razorpayPaymentId);

        Payment payment = new Payment();
        payment.setId("pay-101");
        payment.setRazorpayOrderId(orderId);
        payment.setAccountNumber("AC-101");
        payment.setAmount(new BigDecimal("500.00"));
        payment.setStatus(PaymentStatus.PENDING);

        when(paymentRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.of(payment));

        paymentService.handleWebhook(webhookPayload);

        assertEquals(PaymentStatus.FAILED, payment.getStatus());
        assertEquals("Payment failed via Razorpay", payment.getFailureReason());
        verify(paymentRepository, times(1)).save(payment);
        verify(kafkaTemplate, times(1)).send(eq("payment.failed"), eq("pay-101"), anyMap());
    }

    @Test
    @DisplayName("Handle webhook gracefully when payment not found")
    void handleWebhook_NotFound() {
        String orderId = "order_999999";
        Map<String, Object> webhookPayload = createWebhookPayload("payment.captured", orderId, "pay_123");

        when(paymentRepository.findByRazorpayOrderId(orderId)).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> paymentService.handleWebhook(webhookPayload));
        verify(paymentRepository, never()).save(any(Payment.class));
        verifyNoInteractions(kafkaTemplate);
    }

    @Test
    @DisplayName("Handle webhook ignores unrecognized events")
    void handleWebhook_UnrecognizedEvent() {
        Map<String, Object> webhookPayload = new HashMap<>();
        webhookPayload.put("event", "payment.authorized");

        paymentService.handleWebhook(webhookPayload);

        verifyNoInteractions(paymentRepository);
        verifyNoInteractions(kafkaTemplate);
    }
}
