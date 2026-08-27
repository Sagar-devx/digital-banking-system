package com.sagar.notificationservice.exception;

public class InvalidNotificationPayloadException extends NotificationException {
    public InvalidNotificationPayloadException(String message) {
        super(message);
    }
}
