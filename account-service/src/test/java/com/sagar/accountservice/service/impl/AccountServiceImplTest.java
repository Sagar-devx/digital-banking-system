package com.sagar.accountservice.service.impl;

import com.sagar.accountservice.dto.AccountResponse;
import com.sagar.accountservice.dto.CreateAccountRequest;
import com.sagar.accountservice.entity.Account;
import com.sagar.accountservice.entity.AccountStatus;
import com.sagar.accountservice.entity.AccountType;
import com.sagar.accountservice.repository.AccountRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceImplTest {

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private AccountServiceImpl accountService;

    private Account createSampleAccount(String accountNumber, BigDecimal balance, AccountStatus status) {
        Account account = new Account();
        account.setId(UUID.randomUUID().toString());
        account.setAccountNumber(accountNumber);
        account.setAccountHolderName("Sagar");
        account.setEmail("sagarsharma.devx@gmail.com");
        account.setPhone("9250272790");
        account.setAccountType(AccountType.SAVINGS);
        account.setStatus(status);
        account.setBalance(balance);
        account.setDailyTransactionLimit(new BigDecimal("100000"));
        account.setCreatedAt(LocalDateTime.now());
        return account;
    }

    @Test
    @DisplayName("Create account successfully when email is unique")
    void createAccount_Success() {
        CreateAccountRequest request = new CreateAccountRequest(
                "Sagar",
                "sagarsharma.devx@gmail.com",
                "9250272790",
                AccountType.SAVINGS,
                new BigDecimal("5000")
        );

        String accountNumber = "AC_101";
        Account savedAccount = createSampleAccount(accountNumber, new BigDecimal("5000"), AccountStatus.ACTIVE);

        when(accountRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(accountRepository.existsByAccountNumber(anyString())).thenReturn(false);
        when(accountRepository.save(any(Account.class))).thenReturn(savedAccount);

        AccountResponse response = accountService.createAccount(request);

        assertNotNull(response);
        assertEquals(accountNumber, response.getAccountNumber());
        assertEquals("Sagar", response.getAccountHolderName());
        assertEquals("sagarsharma.devx@gmail.com", response.getEmail());
        assertEquals(new BigDecimal("5000"), response.getBalance());
        assertEquals(AccountStatus.ACTIVE, response.getStatus());

        verify(accountRepository, times(1)).save(any(Account.class));
    }

    @Test
    @DisplayName("Create account throws when email already exists")
    void createAccount_DuplicateEmail() {
        CreateAccountRequest request = new CreateAccountRequest(
                "Sagar",
                "sagarsharma.devx@gmail.com",
                "9250272790",
                AccountType.SAVINGS,
                new BigDecimal("5000")
        );
        when(accountRepository.existsByEmail(request.getEmail())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accountService.createAccount(request);
        });

        assertEquals("Account already exists", exception.getMessage());
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("Get account by account number")
    void getAccount_Success() {
        String accountNumber = "AC_101";
        Account account = createSampleAccount(accountNumber, new BigDecimal("5000"), AccountStatus.ACTIVE);

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        AccountResponse response = accountService.getAccount(accountNumber);

        assertNotNull(response);
        assertEquals(accountNumber, response.getAccountNumber());
        assertEquals("Sagar", response.getAccountHolderName());
        assertEquals(new BigDecimal("5000"), response.getBalance());
        verify(accountRepository, times(1)).findByAccountNumber(accountNumber);
    }

    @Test
    @DisplayName("Get account throws when not found")
    void getAccount_NotFound() {
        String accountNumber = "AC_999";
        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accountService.getAccount(accountNumber);
        });

        assertEquals("Account not found", exception.getMessage());
    }

    @Test
    @DisplayName("Get balance by account number")
    void getBalance_Success() {
        String accountNumber = "AC_101";
        Account account = createSampleAccount(accountNumber, new BigDecimal("7500"), AccountStatus.ACTIVE);

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        BigDecimal balance = accountService.getBalance(accountNumber);

        assertNotNull(balance);
        assertEquals(new BigDecimal("7500"), balance);
        verify(accountRepository, times(1)).findByAccountNumber(accountNumber);
    }

    @Test
    @DisplayName("Get balance throws when not found")
    void getBalance_NotFound() {
        String accountNumber = "AC_999";
        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accountService.getBalance(accountNumber);
        });

        assertEquals("Account not found", exception.getMessage());
    }

    @Test
    @DisplayName("Block account successfully")
    void blockAccount_Success() {
        String accountNumber = "AC_101";
        Account account = createSampleAccount(accountNumber, new BigDecimal("5000"), AccountStatus.ACTIVE);

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        accountService.blockAccount(accountNumber);

        assertEquals(AccountStatus.BLOCKED, account.getStatus());
        verify(accountRepository, times(1)).save(account);
    }

    @Test
    @DisplayName("Block account throws when not found")
    void blockAccount_NotFound() {
        String accountNumber = "AC_999";
        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accountService.blockAccount(accountNumber);
        });

        assertEquals("Account not found", exception.getMessage());
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("Deduct balance when funds are sufficient")
    void deductBalance_Success() {
        String accountNumber = "AC_101";
        BigDecimal deductAmount = new BigDecimal("3000");
        Account account = createSampleAccount(accountNumber, new BigDecimal("8000"), AccountStatus.ACTIVE);

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        accountService.deductBalance(accountNumber, deductAmount);

        assertEquals(new BigDecimal("5000"), account.getBalance());
        verify(accountRepository, times(1)).save(account);
    }

    @Test
    @DisplayName("Deduct balance throws when account not found")
    void deductBalance_NotFound() {
        String accountNumber = "AC_999";
        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accountService.deductBalance(accountNumber, new BigDecimal("1000"));
        });

        assertEquals("Account not found", exception.getMessage());
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("Deduct balance throws when account is not active")
    void deductBalance_AccountNotActive() {
        String accountNumber = "AC_101";
        Account account = createSampleAccount(accountNumber, new BigDecimal("10000"), AccountStatus.CLOSED);

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accountService.deductBalance(accountNumber, new BigDecimal("1000"));
        });

        assertEquals("Account not active", exception.getMessage());
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("Deduct balance throws when insufficient funds")
    void deductBalance_InsufficientFunds() {
        String accountNumber = "AC_101";
        Account account = createSampleAccount(accountNumber, new BigDecimal("2000"), AccountStatus.ACTIVE);

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accountService.deductBalance(accountNumber, new BigDecimal("5000"));
        });

        assertEquals("Insufficient funds", exception.getMessage());
        verify(accountRepository, never()).save(any(Account.class));
    }

    @Test
    @DisplayName("Credit balance successfully")
    void creditBalance_Success() {
        String accountNumber = "AC_101";
        BigDecimal creditAmount = new BigDecimal("4000");
        Account account = createSampleAccount(accountNumber, new BigDecimal("5000"), AccountStatus.ACTIVE);

        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.of(account));

        accountService.creditBalance(accountNumber, creditAmount);

        assertEquals(new BigDecimal("9000"), account.getBalance());
        verify(accountRepository, times(1)).save(account);
    }

    @Test
    @DisplayName("Credit balance throws when account not found")
    void creditBalance_NotFound() {
        String accountNumber = "AC_999";
        when(accountRepository.findByAccountNumber(accountNumber)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            accountService.creditBalance(accountNumber, new BigDecimal("1000"));
        });

        assertEquals("Account not found", exception.getMessage());
        verify(accountRepository, never()).save(any(Account.class));
    }
}