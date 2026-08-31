package com.sagar.accountservice.service.impl;

import com.sagar.accountservice.dto.AccountResponse;
import com.sagar.accountservice.dto.CreateAccountRequest;
import com.sagar.accountservice.entity.Account;
import com.sagar.accountservice.entity.AccountStatus;
import com.sagar.accountservice.exception.AccountAlreadyExistsException;
import com.sagar.accountservice.exception.AccountNotActiveException;
import com.sagar.accountservice.exception.AccountNotFoundException;
import com.sagar.accountservice.exception.InsufficientFundsException;
import com.sagar.accountservice.mapper.AccountMapper;
import com.sagar.accountservice.repository.AccountRepository;
import com.sagar.accountservice.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private static final SecureRandom secureRandom = new SecureRandom();

    @Override
    public AccountResponse createAccount(CreateAccountRequest request) {
        log.info("Create account for : {}", request.getEmail());

        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new AccountAlreadyExistsException("Account already exists with email: " + request.getEmail());
        }

        String accountNumber = generateAccountNumber();
        Account account = AccountMapper.toEntity(request, accountNumber);

        Account savedAccount = accountRepository.save(account);

        log.info("Account created : {}", savedAccount.getAccountNumber());

        return AccountMapper.toResponse(savedAccount);
    }

    @Override
    public AccountResponse getAccount(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with account number: " + accountNumber));

        return AccountMapper.toResponse(account);
    }

    @Override
    public BigDecimal getBalance(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with account number: " + accountNumber));

        return account.getBalance();
    }

    @Override
    @Transactional
    public void blockAccount(String accountNumber) {
        log.info("Blocking account : {}", accountNumber);
        if (!accountRepository.existsByAccountNumber(accountNumber)) {
            throw new AccountNotFoundException("Account not found with account number: " + accountNumber);
        }
        accountRepository.updateStatus(accountNumber, AccountStatus.BLOCKED);
        log.info("Account blocked : {}", accountNumber);
    }

    @Override
    @Transactional
    public void deductBalance(String accountNumber, BigDecimal amount) {
        log.info("Deducting account : {}", accountNumber);

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException("Account not found with account number: " + accountNumber));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException("Account is not active. Current status: " + account.getStatus());
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new InsufficientFundsException("Insufficient funds in account: " + accountNumber + ". Current balance: " + account.getBalance() + ", requested: " + amount);
        }

        accountRepository.subtractBalance(accountNumber, amount);

        log.info("Account deducted : {}", accountNumber);
    }

    @Override
    @Transactional
    public void creditBalance(String accountNumber, BigDecimal amount) {
        log.info("Credit balance : {}", accountNumber);
        
        if (!accountRepository.existsByAccountNumber(accountNumber)) {
            throw new AccountNotFoundException("Account not found with account number: " + accountNumber);
        }

        accountRepository.addBalance(accountNumber, amount);
        log.info("Account Credited : {}", accountNumber);
    }

    private String generateAccountNumber() {
        String accountNumber;

        do {
            long number = secureRandom.nextLong(1000000000000L);
            accountNumber = String.format("%012d", number);
        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }
}
