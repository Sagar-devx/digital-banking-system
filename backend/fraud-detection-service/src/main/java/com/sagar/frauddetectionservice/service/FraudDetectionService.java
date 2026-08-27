package com.sagar.frauddetectionservice.service;

import com.sagar.frauddetectionservice.model.FraudCheckResult;

import java.math.BigDecimal;
import java.util.Map;

public interface FraudDetectionService {

    void checkTransaction(Map<String, Object> payload);
}
