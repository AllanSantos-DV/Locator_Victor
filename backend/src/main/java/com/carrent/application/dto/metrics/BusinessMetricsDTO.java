package com.carrent.application.dto.metrics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessMetricsDTO {

    private RentalMetrics rentalMetrics;
    private VehicleMetrics vehicleMetrics;
    private DiscountMetrics discountMetrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RentalMetrics {
        private long totalRentals;
        private long activeRentals;
        private long completedRentals;
        private long cancelledRentals;
        private double averageDuration; // em dias
        private Map<String, Long> rentalsByMonth;
        private Map<String, Long> rentalsByStatus;
        private List<TopCustomerDTO> topCustomers;
        private List<RentalItemDTO> rentals;
        private Map<String, Map<String, Long>> rentalsByMonthAndStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VehicleMetrics {
        private long totalVehicles;
        private long availableVehicles;
        private long unavailableVehicles;
        private Map<String, Long> vehiclesByCategory;
        private Map<String, Long> vehiclesByStatus;
        private List<TopVehicleDTO> mostRentedVehicles;
        private double averageUtilizationRate; // em porcentagem
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiscountMetrics {
        private long totalDiscountsApplied;
        private BigDecimal totalDiscountAmount;
        private BigDecimal averageDiscountPercentage;
        private Map<String, Long> discountsByType;
        private List<DiscountDistributionDTO> discountDistribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopCustomerDTO {
        private Long customerId;
        private String customerName;
        private long rentalCount;
        private BigDecimal totalSpent;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopVehicleDTO {
        private Long vehicleId;
        private String vehicleModel;
        private String vehicleBrand;
        private String vehiclePlate;
        private long rentalCount;
        private BigDecimal totalRevenue;
        private double utilizationRate; // em porcentagem
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiscountDistributionDTO {
        private String discountRange; // ex: "0-5%", "5-10%", etc.
        private long count;
        private BigDecimal totalAmount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RentalItemDTO {
        private Long id;
        private String startDate;
        private String endDate;
        private String status;
        private Long customerId;
        private String customerName;
        private Long vehicleId;
        private String vehicleModel;
        private BigDecimal totalAmount;
    }
}