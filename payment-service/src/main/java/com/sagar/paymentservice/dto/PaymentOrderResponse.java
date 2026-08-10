package com.sagar.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentOrderResponse {

    private String paymentId;
    private String razorpayOrderId;
    private String amount;
    private String currency;
    private String status;
    private String razorpayKeyId;
}

