package com.carrent.application.dto;

import com.carrent.domain.entity.RentalStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RentalDTO {
    private Long id;

    @NotNull(message = "O ID do veículo é obrigatório")
    @Positive(message = "O ID do veículo deve ser positivo")
    private Long vehicleId;

    private String vehicleBrand;
    private String vehicleModel;
    private String vehiclePlate;

    @NotNull(message = "O ID do cliente é obrigatório")
    @Positive(message = "O ID do cliente deve ser positivo")
    private Long customerId;

    private String customerName;

    @NotNull(message = "A data de início é obrigatória")
    private LocalDateTime startDate;

    @NotNull(message = "A data de término é obrigatória")
    private LocalDateTime endDate;

    private LocalDateTime actualReturnDate;

    @NotNull(message = "O status é obrigatório")
    private RentalStatus status;

    @NotNull(message = "O valor total é obrigatório")
    @Positive(message = "O valor total deve ser positivo")
    private BigDecimal totalAmount;

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}