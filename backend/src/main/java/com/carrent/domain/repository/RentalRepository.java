package com.carrent.domain.repository;

import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

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

        @Query("SELECT COUNT(r) > 0 FROM Rental r WHERE r.customer.id = :customerId " +
                        "AND r.status = 'IN_PROGRESS'")
        boolean hasActiveRentals(@Param("customerId") Long customerId);

        List<Rental> findByCustomerIdAndStatus(Long customerId, RentalStatus status);

        @Query("SELECT r FROM Rental r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.vehicle")
        List<Rental> findAllWithCustomersAndVehicles();

        @Query("SELECT r FROM Rental r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.vehicle")
        Page<Rental> findAllWithCustomersAndVehicles(Pageable pageable);

        @Query("SELECT r FROM Rental r LEFT JOIN FETCH r.customer LEFT JOIN FETCH r.vehicle WHERE r.id = :id")
        Optional<Rental> findByIdWithVehicleAndCustomer(Long id);

        @Transactional
        @Modifying
        @Query("update Rental r set r.status = ?1 where r.id = ?2")
        void updateStatus(RentalStatus status, Long id);

        @Transactional
        @Modifying
        @Query("update Rental r set r.status = ?1, r.actualReturnDate = ?2 where r.id = ?3")
        void updateStatusAndReturnDate(RentalStatus status, LocalDateTime actualReturnDate, Long id);

        @Transactional
        @Modifying
        @Query("update Rental r set r.status = ?1, r.actualReturnDate = ?2, r.earlyTerminationFee = ?3, " +
                        "r.totalAmount = ?4, r.endedEarly = true, r.originalTotalAmount = r.totalAmount where r.id = ?5")
        void updateForEarlyTermination(RentalStatus status, LocalDateTime actualReturnDate,
                        BigDecimal earlyTerminationFee, BigDecimal newTotalAmount, Long id);

        @Transactional
        @Modifying
        @Query("update Rental r set r.endDate = ?1, r.totalAmount = ?2 where r.id = ?3")
        void updateRentalEndDate(LocalDateTime newEndDate, BigDecimal newTotalAmount, Long id);
}