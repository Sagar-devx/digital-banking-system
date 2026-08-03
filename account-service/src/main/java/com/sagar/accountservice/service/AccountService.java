package com.sagar.accountservice.service;

import com.sagar.accountservice.dto.AccountResponse;
import com.sagar.accountservice.dto.CreateAccountRequest;
import com.sagar.accountservice.entity.Account;
import com.sagar.accountservice.entity.AccountStatus;
import com.sagar.accountservice.entity.AccountType;
import com.sagar.accountservice.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService {

    private final AccountRepository accountRepository;
    private static final SecureRandom secureRandom = new SecureRandom();

    public AccountResponse createAccount(CreateAccountRequest request) {
        log.info("Create account for : {}", request.getEmail());

        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Account already exists");
        }
        Account account = new Account();
        account.setEmail(request.getEmail());
        account.setPhone(request.getPhone());
        account.setAccountHolderName(request.getAccountHolderName());
        account.setAccountType(request.getAccountType());
        account.setBalance(request.getInitialDeposit());
        account.setStatus(AccountStatus.ACTIVE);
        account.setAccountNumber(generateAccountNumber());
        account.setDailyTransactionLimit(
                request.getAccountType() == AccountType.SAVINGS
                        ? new BigDecimal("100000")
                        : new  BigDecimal("500000")
        );

        Account savedAccount = accountRepository.save(account);

        log.info("Account created : {}", savedAccount.getAccountNumber());

        return mapToResponse(savedAccount);
    }

    private String generateAccountNumber() {

        String accountNumber;

        do{
            long number =  secureRandom.nextLong(1000000000000L);
            accountNumber = String.format("%012d", number);

        }while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    private AccountResponse mapToResponse(Account account) {
        AccountResponse accountResponse = new AccountResponse();
        accountResponse.setAccountNumber(account.getAccountNumber());
        accountResponse.setBalance(account.getBalance());
        accountResponse.setDailyTransactionLimit(account.getDailyTransactionLimit());
        accountResponse.setId(account.getId());
        accountResponse.setAccountHolderName(account.getAccountHolderName());
        accountResponse.setAccountType(account.getAccountType());
        accountResponse.setEmail(account.getEmail());
        accountResponse.setPhone(account.getPhone());
        accountResponse.setStatus(account.getStatus());
        accountResponse.setCreatedAt(account.getCreatedAt());
        return accountResponse;
    }
}
