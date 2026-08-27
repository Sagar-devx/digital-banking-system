package com.sagar.transactionservice.exception;

public class AccountOperationFailedException extends RuntimeException {
    public AccountOperationFailedException(String message) {
        super(message);
    }

    public AccountOperationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
