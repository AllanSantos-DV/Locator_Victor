package com.carrent.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {
    private int totalVehicles;
    private int availableVehicles;
    private int totalClients;
    private int activeRentals;
    private RecentRentalsPage recentRentals;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentRentalsPage {
        private List<RecentRental> content;
        private int totalPages;
        private long totalElements;
        private int currentPage;
        private int pageSize;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentRental {
        private Long id;
        private String clientName;
        private String vehicleModel;
        private String startDate;
        private String endDate;
        private String status;
    }
}