package com.carrent.application.dto;

import com.carrent.domain.entity.VehicleCategory;
import com.carrent.domain.entity.VehicleStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private Long id;
    private String brand;
    private String model;
    private Integer year;
    private String plate;
    private BigDecimal dailyRate;
    @NotNull(message = "A disponibilidade é obrigatória")
    private Boolean available;
    @NotNull(message = "O status é obrigatório")
    private VehicleStatus status;
    @NotNull(message = "A categoria é obrigatória")
    private VehicleCategory category;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}