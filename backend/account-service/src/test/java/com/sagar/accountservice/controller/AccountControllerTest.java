package com.sagar.accountservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sagar.accountservice.dto.AccountResponse;
import com.sagar.accountservice.dto.CreateAccountRequest;
import com.sagar.accountservice.entity.AccountStatus;
import com.sagar.accountservice.entity.AccountType;
import com.sagar.accountservice.exception.AccountAlreadyExistsException;
import com.sagar.accountservice.exception.AccountNotActiveException;
import com.sagar.accountservice.exception.AccountNotFoundException;
import com.sagar.accountservice.exception.GlobalExceptionHandler;
import com.sagar.accountservice.exception.InsufficientFundsException;
import com.sagar.accountservice.service.AccountService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AccountControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper;

    @Mock
    private AccountService accountService;

    @InjectMocks
    private AccountController accountController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(accountController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
    }

    @Test
    @DisplayName("POST /api/v1/accounts - returns 201 when account created")
    void createAccount_Success() throws Exception {
        CreateAccountRequest request = new CreateAccountRequest(
                "Sagar",
                "sagar@example.com",
                "9250272790",
                AccountType.SAVINGS,
                new BigDecimal("5000")
        );

        AccountResponse response = new AccountResponse(
                "id-1",
                "123456789012",
                "Sagar",
                "sagar@example.com",
                "9250272790",
                AccountType.SAVINGS,
                AccountStatus.ACTIVE,
                new BigDecimal("5000"),
                new BigDecimal("100000"),
                LocalDateTime.now()
        );

        when(accountService.createAccount(any(CreateAccountRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accountNumber").value("123456789012"))
                .andExpect(jsonPath("$.accountHolderName").value("Sagar"))
                .andExpect(jsonPath("$.email").value("sagar@example.com"));
    }

    @Test
    @DisplayName("POST /api/v1/accounts - returns 409 Conflict when account already exists")
    void createAccount_AlreadyExists_Returns409() throws Exception {
        CreateAccountRequest request = new CreateAccountRequest(
                "Sagar",
                "sagar@example.com",
                "9250272790",
                AccountType.SAVINGS,
                new BigDecimal("5000")
        );

        when(accountService.createAccount(any(CreateAccountRequest.class)))
                .thenThrow(new AccountAlreadyExistsException("Account already exists with email: " + request.getEmail()));

        mockMvc.perform(post("/api/v1/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("Account already exists with email: sagar@example.com"))
                .andExpect(jsonPath("$.path").value("/api/v1/accounts"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("GET /api/v1/accounts/{accountNumber} - returns 404 Not Found when account does not exist")
    void getAccount_NotFound_Returns404() throws Exception {
        String accountNumber = "999999999999";
        when(accountService.getAccount(accountNumber))
                .thenThrow(new AccountNotFoundException("Account not found with account number: " + accountNumber));

        mockMvc.perform(get("/api/v1/accounts/{accountNumber}", accountNumber))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Account not found with account number: 999999999999"))
                .andExpect(jsonPath("$.path").value("/api/v1/accounts/999999999999"))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @DisplayName("PUT /api/v1/accounts/{accountNumber}/deduct - returns 400 Bad Request when insufficient funds")
    void deductBalance_InsufficientFunds_Returns400() throws Exception {
        String accountNumber = "123456789012";
        BigDecimal amount = new BigDecimal("5000");

        doThrow(new InsufficientFundsException("Insufficient funds in account: " + accountNumber + ". Current balance: 1000, requested: 5000"))
                .when(accountService).deductBalance(eq(accountNumber), eq(amount));

        mockMvc.perform(put("/api/v1/accounts/{accountNumber}/deduct", accountNumber)
                        .param("amount", amount.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Insufficient funds in account: 123456789012. Current balance: 1000, requested: 5000"))
                .andExpect(jsonPath("$.path").value("/api/v1/accounts/123456789012/deduct"));
    }

    @Test
    @DisplayName("PUT /api/v1/accounts/{accountNumber}/deduct - returns 400 Bad Request when account not active")
    void deductBalance_AccountNotActive_Returns400() throws Exception {
        String accountNumber = "123456789012";
        BigDecimal amount = new BigDecimal("500");

        doThrow(new AccountNotActiveException("Account is not active. Current status: BLOCKED"))
                .when(accountService).deductBalance(eq(accountNumber), eq(amount));

        mockMvc.perform(put("/api/v1/accounts/{accountNumber}/deduct", accountNumber)
                        .param("amount", amount.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Bad Request"))
                .andExpect(jsonPath("$.message").value("Account is not active. Current status: BLOCKED"))
                .andExpect(jsonPath("$.path").value("/api/v1/accounts/123456789012/deduct"));
    }
}
