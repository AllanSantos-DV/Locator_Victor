package com.carrent.domain.exception;

public class CustomerNotFoundException extends RuntimeException {
    public CustomerNotFoundException(Long id) {
        super("Cliente não encontrado com ID: " + id);
    }

    public CustomerNotFoundException(String document, String type) {
        super("Cliente não encontrado com " + type + ": " + document);
    }
}