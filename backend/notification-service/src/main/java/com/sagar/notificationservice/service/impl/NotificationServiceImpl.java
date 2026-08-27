package com.sagar.notificationservice.service.impl;

import com.sagar.notificationservice.client.AccountClient;
import com.sagar.notificationservice.dto.AccountResponse;
import com.sagar.notificationservice.service.NotificationService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final AccountClient accountClient;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.properties.mail.smtp.from:your_email@example.com}")
    private String fromEmail;

    @Override
    @KafkaListener(topics = "transaction.otp.generated")
    public void consumeOtpGenerated(@Payload Map<String, Object> payload) {
        try {
            String accountNumber = (String) payload.get("accountNumber");
            String otp = (String) payload.get("otp");
            String amount = payload.get("amount").toString();
            String reason = payload.get("reason").toString();

            sendAlert(
                    accountNumber,
                    "TRANSACTION VERIFICATION REQUIRED",
                    String.format(
                            "Suspicious activity detected on your account.<br>" +
                            "<strong>Reason:</strong> %s<br>" +
                            "<strong>Transaction Amount:</strong> ₹%s<br><br>" +
                            "<div style='background-color:#f1f5f9; border:2px dashed #2563eb; border-radius:8px; padding:16px; text-align:center; margin:16px 0;'>" +
                            "<span style='font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:1px;'>One-Time Password (OTP)</span><br>" +
                            "<span style='font-size:32px; font-weight:bold; color:#1e3a8a; letter-spacing:6px; font-family:monospace;'>%s</span><br>" +
                            "<span style='font-size:12px; color:#ef4444;'>Valid for 5 minutes. Do not share with anyone.</span>" +
                            "</div>" +
                            "If you did not initiate this transaction, please contact bank customer support immediately.",
                            reason, amount, otp
                    )
            );
        } catch (Exception e) {
            log.error("Error sending OTP notification: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "transaction.completed")
    public void consumeTransactionCompleted(@Payload Map<String, Object> payload) {
        try {
            String senderAccount = (String) payload.get("senderAccountNumber");
            String receiverAccount = (String) payload.get("receiverAccountNumber");
            String amount = payload.get("amount").toString();

            // DEBIT ALERT FOR SENDER
            sendAlert(
                    senderAccount,
                    "DEBIT ALERT",
                    String.format(
                            "Your account has been debited by <strong>₹%s</strong>.<br>" +
                            "<strong>Transferred To:</strong> Account ending in ...%s<br>" +
                            "<strong>Status:</strong> <span style='color:#16a34a; font-weight:bold;'>SUCCESSFUL</span>",
                            amount, maskAccount(receiverAccount)
                    )
            );

            // CREDIT ALERT FOR RECEIVER
            sendAlert(
                    receiverAccount,
                    "CREDIT ALERT",
                    String.format(
                            "Your account has been credited with <strong>₹%s</strong>.<br>" +
                            "<strong>Received From:</strong> Account ending in ...%s<br>" +
                            "<strong>Status:</strong> <span style='color:#16a34a; font-weight:bold;'>COMPLETED</span>",
                            amount, maskAccount(senderAccount)
                    )
            );
        } catch (Exception e) {
            log.error("Error sending transaction completed notification: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "fraud.detected")
    public void consumeFraudDetected(@Payload Map<String, Object> payload) {
        try {
            String accountNumber = payload.get("accountNumber").toString();
            String reason = payload.get("reason").toString();

            sendAlert(
                    accountNumber,
                    "SUSPICIOUS ACTIVITY DETECTED",
                    String.format(
                            "<div style='background-color:#fee2e2; border-left:4px solid #ef4444; padding:12px; margin-bottom:12px; color:#991b1b;'>" +
                            "<strong>URGENT SECURITY NOTICE:</strong> Your account has been temporarily <strong>BLOCKED</strong>." +
                            "</div>" +
                            "<strong>Reason:</strong> %s<br><br>" +
                            "Please contact your nearest bank branch with KYC documents to restore access.",
                            reason
                    )
            );
        } catch (Exception e) {
            log.error("Error sending fraud alert: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "transaction.refunded")
    public void consumeTransactionRefunded(@Payload Map<String, Object> payload) {
        try {
            String senderAccount = (String) payload.get("senderAccountNumber");
            String amount = payload.get("amount").toString();
            String reason = payload.get("reason").toString();

            sendAlert(
                    senderAccount,
                    "REFUND PROCESSED",
                    String.format(
                            "Your transaction was cancelled and a refund of <strong>₹%s</strong> has been credited back to your account.<br>" +
                            "<strong>Reason:</strong> %s",
                            amount, reason
                    )
            );
        } catch (Exception e) {
            log.error("Error sending refund notification: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "payment.completed")
    public void consumePaymentCompleted(@Payload Map<String, Object> payload) {
        try {
            String accountNumber = payload.get("accountNumber").toString();
            String amount = payload.get("amount").toString();
            String paymentId = payload.get("razorpayPaymentId") != null ? payload.get("razorpayPaymentId").toString() : "N/A";

            sendAlert(
                    accountNumber,
                    "PAYMENT SUCCESSFUL",
                    String.format(
                            "Online payment of <strong>₹%s</strong> was completed successfully via Razorpay.<br>" +
                            "<strong>Razorpay Payment ID:</strong> %s",
                            amount, paymentId
                    )
            );
        } catch (Exception e) {
            log.error("Error sending payment notification: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "payment.failed")
    public void consumePaymentFailed(@Payload Map<String, Object> payload) {
        try {
            String accountNumber = payload.get("accountNumber").toString();
            String amount = payload.get("amount").toString();

            sendAlert(
                    accountNumber,
                    "PAYMENT FAILED",
                    String.format(
                            "Online payment of <strong>₹%s</strong> could not be processed.<br>" +
                            "Please try again or check with your payment provider.",
                            amount
                    )
            );
        } catch (Exception e) {
            log.error("Error sending payment failure notification: {}", e.getMessage(), e);
        }
    }

    private void sendAlert(String accountNumber, String subject, String messageHtml) {

        try {
            Optional<AccountResponse> accountOpt = accountClient.getAccount(accountNumber);
            String recipientEmail = accountOpt.map(AccountResponse::getEmail).orElse(null);
            String recipientName = accountOpt.map(AccountResponse::getAccountHolderName).orElse("Valued Customer");

            if (recipientEmail == null || recipientEmail.isBlank()) {
                log.warn("No registered email found for account: {}. Skipping email dispatch.", accountNumber);
                return;
            }

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(recipientEmail);
            helper.setSubject(subject + " | Digital Banking System");

            String htmlBody = buildHtmlTemplate(accountNumber, subject, messageHtml, recipientName);
            helper.setText(htmlBody, true); // true = HTML format

            mailSender.send(mimeMessage);
            log.info("HTML Email sent via Brevo to: {} | Subject: {}", recipientEmail, subject);
        } catch (Exception e) {
            log.error("Error sending email via Brevo: {}", e.getMessage());
        }
    }

    private String buildHtmlTemplate(String accountNumber, String subject, String messageHtml, String recipientName) {
        String headerColor = getHeaderColor(subject);

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin:0; padding:20px; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; color:#1e293b;">
                    <div style="max-width:600px; margin:auto; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                        <!-- Brand Header -->
                        <div style="background-color:#0f172a; padding:24px 30px; text-align:center;">
                            <h1 style="color:#ffffff; margin:0; font-size:22px; letter-spacing:1px;">DIGITAL BANKING SYSTEM</h1>
                            <p style="color:#94a3b8; margin:4px 0 0 0; font-size:13px;">Instant & Secure Financial Alerts</p>
                        </div>
                        
                        <!-- Alert Banner -->
                        <div style="background-color:%s; padding:12px 30px; color:#ffffff; font-weight:bold; font-size:15px; letter-spacing:0.5px; text-align:center;">
                            %s
                        </div>
                        
                        <!-- Body Content -->
                        <div style="padding:28px 30px;">
                            <p style="font-size:16px; margin:0 0 16px 0;">Dear <strong>%s</strong>,</p>
                            <div style="font-size:14px; line-height:1.6; color:#334155;">
                                %s
                            </div>
                            
                            <div style="margin-top:24px; padding:12px 16px; background-color:#f8fafc; border-radius:6px; border:1px solid #e2e8f0; font-size:13px; color:#64748b;">
                                <span>Account Number: <strong>...%s</strong></span>
                            </div>
                        </div>
                        
                        <!-- Footer -->
                        <div style="background-color:#f1f5f9; padding:20px 30px; border-top:1px solid #e2e8f0; text-align:center; font-size:12px; color:#64748b; line-height:1.5;">
                            <p style="margin:0 0 4px 0;">🔒 <em>Never share your OTP, PIN, or password with anyone, including bank representatives.</em></p>
                            <p style="margin:0; color:#94a3b8;">© 2026 Digital Banking System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(headerColor, subject, recipientName, messageHtml, maskAccount(accountNumber));
    }

    private String getHeaderColor(String subject) {
        if (subject.contains("CREDIT") || subject.contains("SUCCESSFUL")) {
            return "#16a34a"; // Green
        } else if (subject.contains("DEBIT") || subject.contains("BLOCKED") || subject.contains("FAILED") || subject.contains("SUSPICIOUS")) {
            return "#dc2626"; // Red
        } else {
            return "#2563eb"; // Blue (OTP /Refund /Info)
        }
    }

    private String maskAccount(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            return accountNumber != null ? accountNumber : "N/A";
        }
        return accountNumber.substring(accountNumber.length() - 4);
    }
}
