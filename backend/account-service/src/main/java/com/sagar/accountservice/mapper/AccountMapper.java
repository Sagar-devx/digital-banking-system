package com.sagar.accountservice.mapper;

import com.sagar.accountservice.dto.AccountResponse;
import com.sagar.accountservice.dto.CreateAccountRequest;
import com.sagar.accountservice.entity.Account;
import com.sagar.accountservice.entity.AccountStatus;
import com.sagar.accountservice.entity.AccountType;

import java.math.BigDecimal;

public class AccountMapper {

    public static Account toEntity(CreateAccountRequest request, String accountNumber) {
        if (request == null) {
            return null;
        }
        Account account = new Account();
        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        account.setAccountHolderName(request.getAccountHolderName());
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getInitialDeposit());
        account.setStatus(AccountStatus.ACTIVE);
        account.setAccountNumber(accountNumber);
        account.setDailyTransactionLimit(
                request.getAccountType() == AccountType.SAVINGS
                        ? new BigDecimal("100000")
                        : new BigDecimal("500000")
        );
        return account;
    }

    public static AccountResponse toResponse(Account account) {
        if (account == null) {
            return null;
        }

        AccountResponse accountResponse = new AccountResponse();
        accountResponse.setId(account.getId());
        accountResponse.setAccountNumber(account.getAccountNumber());
        accountResponse.setAccountHolderName(account.getAccountHolderName());
        accountResponse.setEmail(account.getEmail());
        accountResponse.setPhone(account.getPhone());
        accountResponse.setAccountType(account.getAccountType());
        accountResponse.setStatus(account.getStatus());
        accountResponse.setBalance(account.getBalance());
        accountResponse.setDailyTransactionLimit(account.getDailyTransactionLimit());
        accountResponse.setCreatedAt(account.getCreatedAt());
        return accountResponse;
    }
}

