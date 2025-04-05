package com.carrent.domain.repository;

import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
        List<Rental> findByCustomerId(Long customerId);

        List<Rental> findByVehicleId(Long vehicleId);

        List<Rental> findByStatus(RentalStatus status);

        @Query("SELECT r FROM Rental r WHERE " +
                        "(r.startDate BETWEEN :start AND :end) OR " +
                        "(r.endDate BETWEEN :start AND :end) OR " +
                        "(r.startDate <= :start AND r.endDate >= :end)")
        List<Rental> findByStartDateBetweenOrEndDateBetween(
                        @Param("start") LocalDateTime start,
                        @Param("end") LocalDateTime end);

        @Query("SELECT r FROM Rental r WHERE r.vehicle.id = :vehicleId " +
                        "AND r.id != :excludeRentalId " +
                        "AND r.status IN :activeStatuses " +
                        "AND ((r.startDate BETWEEN :startDate AND :endDate) " +
                        "OR (r.endDate BETWEEN :startDate AND :endDate) " +
                        "OR (r.startDate <= :startDate AND r.endDate >= :endDate))")
        List<Rental> findOverlappingRentals(
                        @Param("vehicleId") Long vehicleId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate,
                        @Param("excludeRentalId") Long excludeRentalId,
                        @Param("activeStatuses") List<RentalStatus> activeStatuses);

        @Query("SELECT r FROM Rental r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.vehicle")
        List<Rental> findAllWithCustomersAndVehicles();

        @Query("SELECT r FROM Rental r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.vehicle")
        Page<Rental> findAllWithCustomersAndVehicles(Pageable pageable);

        @Query("SELECT r FROM Rental r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.vehicle WHERE r.id = :id")
        Optional<Rental> findByIdWithVehicleAndCustomer(Long id);
}