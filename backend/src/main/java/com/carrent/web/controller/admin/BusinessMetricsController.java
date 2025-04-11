package com.carrent.web.controller.admin;

import com.carrent.application.dto.metrics.BusinessMetricsDTO;
import com.carrent.application.service.admin.BusinessMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/metrics")
@RequiredArgsConstructor
@Tag(name = "Admin - Métricas de Negócio", description = "API para gerenciamento de métricas de negócio")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN')")
public class BusinessMetricsController {

    private final BusinessMetricsService businessMetricsService;

    @GetMapping("/business")
    @Operation(summary = "Obter métricas gerais de negócio")
    public ResponseEntity<BusinessMetricsDTO> getBusinessMetrics(
            @RequestParam(required = false) String days,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(businessMetricsService.getBusinessMetrics(days, startDate, endDate, category, status));
    }

    @GetMapping("/rentals")
    @Operation(summary = "Obter métricas específicas de aluguéis")
    public ResponseEntity<BusinessMetricsDTO.RentalMetrics> getRentalMetrics(
            @RequestParam(required = false) String days,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(businessMetricsService.getBusinessMetrics(days, startDate, endDate, category, status)
                .getRentalMetrics());
    }

    @GetMapping("/vehicles")
    @Operation(summary = "Obter métricas específicas de veículos")
    public ResponseEntity<BusinessMetricsDTO.VehicleMetrics> getVehicleMetrics(
            @RequestParam(required = false) String days,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(businessMetricsService.getBusinessMetrics(days, startDate, endDate, category, status)
                .getVehicleMetrics());
    }

    @GetMapping("/discounts")
    @Operation(summary = "Obter métricas específicas de descontos")
    public ResponseEntity<BusinessMetricsDTO.DiscountMetrics> getDiscountMetrics(
            @RequestParam(required = false) String days,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(businessMetricsService.getBusinessMetrics(days, startDate, endDate, category, status)
                .getDiscountMetrics());
    }
}