package com.sagar.accountservice.repository;

import com.sagar.accountservice.entity.Account;
import com.sagar.accountservice.entity.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, String> {

    boolean existsByEmail(String email);

    boolean existsByAccountNumber(String accountNumber);

    Optional<Account> findByAccountNumber(String accountNumber);

    @Modifying
    @Query("UPDATE Account a SET a.balance = a.balance + :amount WHERE a.accountNumber = :accountNumber")
    void addBalance(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    @Modifying
    @Query("UPDATE Account a SET a.balance = a.balance - :amount WHERE a.accountNumber = :accountNumber")
    void subtractBalance(@Param("accountNumber") String accountNumber, @Param("amount") BigDecimal amount);

    @Modifying
    @Query("UPDATE Account a SET a.status = :status WHERE a.accountNumber = :accountNumber")
    void updateStatus(@Param("accountNumber") String accountNumber, @Param("status") AccountStatus status);
}

