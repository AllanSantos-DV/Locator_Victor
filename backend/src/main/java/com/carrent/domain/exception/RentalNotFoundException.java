package com.carrent.domain.exception;

public class RentalNotFoundException extends RuntimeException {
    public RentalNotFoundException(Long id) {
        super("Locação não encontrada com ID: " + id);
    }

}