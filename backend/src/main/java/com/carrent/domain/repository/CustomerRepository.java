package com.carrent.domain.repository;

import com.carrent.domain.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByDocument(String document);

    boolean existsByEmail(String email);

    boolean existsByDocument(String document);

}