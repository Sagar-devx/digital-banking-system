package com.sagar.accountservice.service.impl;

import com.sagar.accountservice.dto.AccountResponse;
import com.sagar.accountservice.dto.CreateAccountRequest;
import com.sagar.accountservice.entity.Account;
import com.sagar.accountservice.entity.AccountStatus;
import com.sagar.accountservice.mapper.AccountMapper;
import com.sagar.accountservice.repository.AccountRepository;
import com.sagar.accountservice.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private static final SecureRandom secureRandom = new SecureRandom();

    // Create new bank account
    @Override
    public AccountResponse createAccount(CreateAccountRequest request) {
        log.info("Create account for : {}", request.getEmail());

        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Account already exists");
        }

        String accountNumber = generateAccountNumber();
        Account account = AccountMapper.toEntity(request, accountNumber);

        Account savedAccount = accountRepository.save(account);

        log.info("Account created : {}", savedAccount.getAccountNumber());

        return AccountMapper.toResponse(savedAccount);
    }

    // Get account details by account number
    @Override
    public AccountResponse getAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return AccountMapper.toResponse(account);
    }

    // Get current account balance
    @Override
    public BigDecimal getBalance(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return account.getBalance();
    }

    // Block account (called by fraud detection service)
    @Override
    public void blockAccount(String accountNumber) {
        log.info("Blocking account : {}", accountNumber);
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        account.setStatus(AccountStatus.BLOCKED);
        accountRepository.save(account);
        log.info("Account blocked : {}", account.getAccountNumber());
    }

    // Deduct balance after verifying active status and sufficient funds
    @Override
    public void deductBalance(String accountNumber, BigDecimal amount) {
        log.info("Deducting account : {}", accountNumber);

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new RuntimeException("Account not active");
        }

        // Check for sufficient balance
        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        log.info("Account deducted : {}", account.getAccountNumber());
    }

    // Credit balance to account
    @Override
    public void creditBalance(String accountNumber, BigDecimal amount) {
        log.info("Credit balance : {}", accountNumber);

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
        log.info("Account Credited, New Balance : {}", account.getBalance());
    }

    // Generate unique 12-digit account number
    private String generateAccountNumber() {
        String accountNumber;

        do {
            long number = secureRandom.nextLong(1000000000000L);
            accountNumber = String.format("%012d", number);
        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }
}
