package com.sagar.frauddetectionservice.exception;

public class InvalidTransactionPayloadException extends RuntimeException {
    public InvalidTransactionPayloadException(String message) {
        super(message);
    }
}
