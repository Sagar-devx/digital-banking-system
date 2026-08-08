package com.sagar.transactionservice.service;

import com.sagar.transactionservice.dto.TransactionRequest;
import com.sagar.transactionservice.dto.TransactionResponse;

import java.util.List;

public interface TransactionService {

    TransactionResponse transfer(TransactionRequest request);

    TransactionResponse getTransaction(String transactionId);

    List<TransactionResponse> getTransactionHistory(String accountNumber);

    TransactionResponse verifyOTP(String transactionId, String otp);
}
