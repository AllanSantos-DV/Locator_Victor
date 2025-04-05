package com.carrent.domain.entity;

public enum VehicleStatus {
    AVAILABLE("Disponível"),
    RENTED("Alugado"),
    MAINTENANCE("Em Manutenção");

    private final String description;

    VehicleStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}