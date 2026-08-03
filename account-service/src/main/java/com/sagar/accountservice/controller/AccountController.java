package com.sagar.accountservice.controller;

import com.sagar.accountservice.dto.AccountResponse;
import com.sagar.accountservice.dto.CreateAccountRequest;
import com.sagar.accountservice.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody CreateAccountRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.createAccount(request));
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponse> getAccount(
            @PathVariable String accountNumber)
    {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.getAccount(accountNumber));
    }

    @GetMapping("/{accountNumber}/balance")
    public ResponseEntity<BigDecimal> getBalance(
            @PathVariable String accountNumber)
    {
        return ResponseEntity.status(HttpStatus.OK).body(accountService.getBalance(accountNumber));
    }

    @PutMapping("/{accountNumber}/block")
    public ResponseEntity<String> blockAccount(
            @PathVariable String accountNumber)
    {
        accountService.blockAccount(accountNumber);
        return ResponseEntity.status(HttpStatus.OK).body("Account blocked successfully");
    }

    /**
     * SAGA STEP 1 - Deduct Balance
     * Called by Transaction Service when transfer is initiated
     **/

    @PutMapping("/{accountNumber}/deduct")
    public ResponseEntity<String> deductBalance(
            @PathVariable String accountNumber,
            @RequestParam BigDecimal amount)
    {
     accountService.deductBalance(accountNumber,amount);
     return ResponseEntity.status(HttpStatus.OK).body("Balance deducted successfully");
    }

    /**
     * SAGA STEP 4 Compensating transaction endpoint
     * CALLED BY TRANSACTION SERVICE in Two scenerios
     * 1. Fraud detected -> refund sender (undo step 1)
     * 2. Transaction completed -> credit receiver
     */

    @PutMapping("/{accountNumber}/credit")
    public ResponseEntity<String> creditBalance(
            @PathVariable String accountNumber,
            @RequestParam BigDecimal amount)
    {
        accountService.creditBalance(accountNumber,amount);
        return ResponseEntity.status(HttpStatus.OK).body("Balance credited successfully");
    }
}
