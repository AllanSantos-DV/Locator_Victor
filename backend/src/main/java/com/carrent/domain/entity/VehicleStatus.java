package com.carrent.domain.entity;

import lombok.Getter;

@Getter
public enum VehicleStatus {
    AVAILABLE("Disponível"),
    RENTED("Alugado"),
    RESERVED("Reservado"),
    MAINTENANCE("Em Manutenção");

    private final String description;

    VehicleStatus(String description) {
        this.description = description;
    }

}