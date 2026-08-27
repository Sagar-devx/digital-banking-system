package com.sagar.paymentservice.config;

import com.sagar.paymentservice.exception.InvalidPaymentRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Component
public class PaymentWebhookVerifier {

    private final String webhookSecret;

    public PaymentWebhookVerifier(@Value("${razorpay.webhook-secret:}") String webhookSecret) {
        this.webhookSecret = webhookSecret;
    }

    public void verify(String payload, String signature) {

        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new InvalidPaymentRequestException("Razorpay webhook secret is not configured");
        }
        if (signature == null || signature.isBlank()) {
            throw new InvalidPaymentRequestException("Missing Razorpay webhook signature");
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            byte[] provided = hexToBytes(signature);
            if (!MessageDigest.isEqual(expected, provided)) {
                throw new InvalidPaymentRequestException("Invalid Razorpay webhook signature");
            }
        } catch (InvalidPaymentRequestException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new InvalidPaymentRequestException("Unable to verify Razorpay webhook signature");
        }
    }

    private byte[] hexToBytes(String value) {
        if ((value.length() & 1) != 0) {
            throw new IllegalArgumentException("Invalid signature");
        }
        byte[] result = new byte[value.length() / 2];
        for (int i = 0; i < value.length(); i += 2) {
            result[i / 2] = (byte) Integer.parseInt(value.substring(i, i + 2), 16);
        }
        return result;
    }
}