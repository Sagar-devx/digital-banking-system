package com.sagar.notificationservice.client;

import com.sagar.notificationservice.dto.AccountResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Optional;

@Component
@Slf4j
public class AccountClient {

    private final RestClient restClient;

    public AccountClient(
            @Value("${account.service.url:http://localhost:8081}") String accountServiceUrl){
        this.restClient = RestClient.builder()
                .baseUrl(accountServiceUrl)
                .build();
    }

    public Optional<AccountResponse> getAccount(String accountNumber) {
        try {
            AccountResponse response = restClient.get()
                    .uri("/api/v1/accounts/{accountNumber}", accountNumber)
                    .retrieve()
                    .body(AccountResponse.class);
            return Optional.ofNullable(response);
        } catch (Exception e) {
            log.warn("Could not fetch account details for account {}: {}", accountNumber, e.getMessage());
            return Optional.empty();
        }
    }
}
