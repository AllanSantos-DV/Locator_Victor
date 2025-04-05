package com.carrent.domain.exception;

public class VehicleNotFoundException extends RuntimeException {
    public VehicleNotFoundException(Long id) {
        super("Veículo não encontrado com ID: " + id);
    }

    public VehicleNotFoundException(String plate) {
        super("Veículo não encontrado com placa: " + plate);
    }
}