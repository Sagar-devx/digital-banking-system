package com.sagar.accountservice.service;

import com.sagar.accountservice.dto.AccountResponse;
import com.sagar.accountservice.dto.CreateAccountRequest;

import java.math.BigDecimal;

public interface AccountService {

    AccountResponse createAccount(CreateAccountRequest request);

    AccountResponse getAccount(String accountNumber);

    BigDecimal getBalance(String accountNumber);

    void blockAccount(String accountNumber);

    void deductBalance(String accountNumber, BigDecimal amount);

    void creditBalance(String accountNumber, BigDecimal amount);
}
