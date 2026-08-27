package com.sagar.transactionservice.service.impl;

import com.sagar.transactionservice.client.AccountServiceClient;
import com.sagar.transactionservice.dto.TransactionRequest;
import com.sagar.transactionservice.dto.TransactionResponse;
import com.sagar.transactionservice.entity.Transaction;
import com.sagar.transactionservice.entity.TransactionStatus;
import com.sagar.transactionservice.entity.TransactionType;
import com.sagar.transactionservice.event.TransactionCompletedEvent;
import com.sagar.transactionservice.event.TransactionInitiatedEvent;
import com.sagar.transactionservice.exception.AccountOperationFailedException;
import com.sagar.transactionservice.exception.InvalidTransactionException;
import com.sagar.transactionservice.exception.TransactionNotFoundException;
import com.sagar.transactionservice.repository.TransactionRepository;
import com.sagar.transactionservice.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountServiceClient accountServiceClient;

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String TRANSACTION_INITIATED_TOPIC = "transaction.initiated";
    private static final String TRANSACTION_COMPLETED_TOPIC = "transaction.completed";
    private static final String TRANSACTION_REFUNDED_TOPIC = "transaction.refunded";
    private static final String FRAUD_DETECTED_TOPIC = "fraud.detected";

    /**
     * SAGA STEP -1 Initiate transfer
     * Deducts from sender via feign
     * save transaction as PROCESSING
     * Publish event to kafka for fraud check
     *
     * @param request
     * @return
     */
    @Override
    public TransactionResponse transfer(TransactionRequest request) {
        if (request.getSenderAccountNumber() != null && request.getSenderAccountNumber().equals(request.getReceiverAccountNumber())) {
            throw new InvalidTransactionException("Sender and receiver account numbers cannot be identical");
        }

        log.info("SAGA START - Transfer: {} -> {} amount : {}",
                request.getSenderAccountNumber(),
                request.getReceiverAccountNumber(),
                request.getAmount());

        // Validate the recipient before the sender balance is debited.
        try {
            accountServiceClient.validateAccount(request.getReceiverAccountNumber());
        } catch (Exception e) {
            log.warn("Recipient account {} could not be validated: {}", request.getReceiverAccountNumber(), e.getMessage());
            throw new InvalidTransactionException("Recipient account was not found or is unavailable");
        }
        //SAGA STEP 1: Deduct from sender account via feign client
        try {
            accountServiceClient.deductBalance(request.getSenderAccountNumber(), request.getAmount());
        } catch (Exception e) {
            log.error("Failed to deduct balance for account {}: {}", request.getSenderAccountNumber(), e.getMessage());
            throw new AccountOperationFailedException(e.getMessage() != null ? e.getMessage() : "Failed to deduct balance from sender account");
        }

        Transaction transaction = new Transaction();
        transaction.setSenderAccountNumber(request.getSenderAccountNumber());
        transaction.setReceiverAccountNumber(request.getReceiverAccountNumber());
        transaction.setAmount(request.getAmount());
        transaction.setStatus(TransactionStatus.PROCESSING);
        transaction.setType(TransactionType.TRANSFER);
        String description = (request.getDescription() != null && !request.getDescription().trim().isEmpty())
                ? request.getDescription().trim()
                : "Transfer";
        transaction.setDescription(description);
        transaction.setReferenceNumber(UUID.randomUUID().toString());

        Transaction savedTransaction = transactionRepository.save(transaction);
        log.info("Transaction saved as PROCESSING: {}", savedTransaction.getId());

        //SAGA STEP 2 - publish for fraud check
        TransactionInitiatedEvent event = new TransactionInitiatedEvent(
                savedTransaction.getId(),
                savedTransaction.getSenderAccountNumber(),
                savedTransaction.getReceiverAccountNumber(),
                savedTransaction.getAmount(),
                savedTransaction.getDescription()
        );

        kafkaTemplate.send(TRANSACTION_INITIATED_TOPIC, savedTransaction.getId(), event);
        log.info("TransactionInitiatedEvent published to Kafka for transaction: {}", savedTransaction.getId());

        return mapToResponse(savedTransaction);
    }

    @Override
    public TransactionResponse getTransaction(String transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with ID: " + transactionId));
        return mapToResponse(transaction);
    }

    @Override
    public List<TransactionResponse> getTransactionHistory(String accountNumber) {

        return transactionRepository.findBySenderAccountNumberOrReceiverAccountNumberOrderByCreatedAtDesc(accountNumber, accountNumber)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TransactionResponse verifyOTP(String transactionId, String otp) {

        log.info("Verifying OTP for transaction: {}", transactionId);

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with ID: " + transactionId));

        String otpKey = "transaction:otp:" + transactionId;
        String storedOtp = redisTemplate.opsForValue().get(otpKey);

        if (storedOtp == null) {
            // OTP EXPIRED
            log.info("OTP expired for transaction: {}", transactionId);
            compensateTransaction(transaction, "OTP expired - transaction cancelled and amount refunded");
            return mapToResponse(transaction);
        }

        if (!storedOtp.equals(otp)) {
            // Block transaction and refund
            log.warn("Wrong OTP - blocking account and refunding: {}", transactionId);
            redisTemplate.delete(otpKey);
            blockAccountandCompensate(transaction, "Wrong OTP entered - transaction cancelled, " +
                    "account blocked for security");
            return mapToResponse(transaction);
        }

        //OTP correct - complete transaction
        log.info("OTP verified - completing transaction: {}", transactionId);
        redisTemplate.delete(otpKey);
        completeTransaction(transaction);
        return mapToResponse(transaction);
    }

    private void blockAccountandCompensate(Transaction transaction, String reason) {

        //publish fraud.detected -> Account Service will block account
        Map<String, Object> fraudEvent = Map.of(
                "transactionId", transaction.getId(),
                "accountNumber", transaction.getSenderAccountNumber(),
                "reason", reason
        );
        kafkaTemplate.send(FRAUD_DETECTED_TOPIC, transaction.getSenderAccountNumber(), fraudEvent);

        log.warn("fraud.detected published - account: {} will be blocked, Kindly contact to the bank",
                transaction.getSenderAccountNumber());

        // SAGA COMPENSATION - refund sender
        compensateTransaction(transaction, "Account blocked for fraud detection");
    }

    private void compensateTransaction(Transaction transaction, String reason) {
        log.info("SAGA COMPENSATION - refunding: {} amount: {}",
                transaction.getSenderAccountNumber(),
                transaction.getAmount());

        //Credit money back to sender synchronously
        accountServiceClient.creditBalance(transaction.getSenderAccountNumber(), transaction.getAmount());
        transaction.setFailureReason(reason + " - SAGA Compensation executed, amount refunded at "+ LocalDateTime.now());
        transaction.setStatus(TransactionStatus.FLAGGED);
        transactionRepository.save(transaction);

        //PUBLISH refund event - Notification service will alert user
        Map<String, Object> refundEvent = Map.of(
                "transactionId", transaction.getId(),
                "senderAccountNumber", transaction.getSenderAccountNumber(),
                "amount", transaction.getAmount(),
                "reason", reason
        );
        kafkaTemplate.send(TRANSACTION_REFUNDED_TOPIC, transaction.getId(), refundEvent);

        log.info("SAGA COMPENSATION - {} refunded to {}", transaction.getAmount(), transaction.getSenderAccountNumber());
    }

    private void completeTransaction(Transaction transaction){
        // Credit first. A completed transaction not leave the receiver unpaid.
        try {
            accountServiceClient.creditBalance(transaction.getReceiverAccountNumber(), transaction.getAmount());
        } catch (Exception e) {
            log.error("Unable to credit recipient {} for transaction {}", transaction.getReceiverAccountNumber(), transaction.getId(), e);
            compensateTransaction(transaction, "Recipient credit failed - transaction cancelled and amount refunded");
            return;
        }
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setCompletedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        TransactionCompletedEvent completedEvent = new TransactionCompletedEvent();
        completedEvent.setTransactionId(transaction.getId());
        completedEvent.setAmount(transaction.getAmount());
        completedEvent.setDescription(transaction.getDescription());
        completedEvent.setSenderAccountNumber(transaction.getSenderAccountNumber());
        completedEvent.setReceiverAccountNumber(transaction.getReceiverAccountNumber());

        kafkaTemplate.send(TRANSACTION_COMPLETED_TOPIC,transaction.getId(), completedEvent);

        log.info("SAGA COMPLETE - Transaction {} completed", transaction.getId());
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .senderAccountNumber(transaction.getSenderAccountNumber())
                .receiverAccountNumber(transaction.getReceiverAccountNumber())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .type(transaction.getType())
                .description(transaction.getDescription())
                .referenceNumber(transaction.getReferenceNumber())
                .failureReason(transaction.getFailureReason())
                .createdAt(transaction.getCreatedAt())
                .completedAt(transaction.getCompletedAt())
                .build();
    }

    public void processCleanResult(String transactionId) {

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("Transaction not found with ID: " + transactionId));

        if(transaction.getStatus() != TransactionStatus.PROCESSING)
        {
            log.warn("Transaction {} is not in PROCESSING state, skipping", transactionId);
            return;
        }
        completeTransaction(transaction);
    }
}

