package com.carrent.domain.repository;

import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.entity.VehicleCategory;
import com.carrent.domain.entity.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByPlate(String plate);

    List<Vehicle> findByAvailableTrue();

    List<Vehicle> findByCategoryAndAvailableTrue(VehicleCategory category);

    boolean existsByPlate(String plate);

    Optional<Vehicle> findVehicleByPlate(String plate);

    @Transactional
    @Modifying
    @Query("update Vehicle v set v.status = ?1, v.available = ?2 where v.id = ?3")
    void updateStatus(VehicleStatus status, Boolean available, Long id);

    List<Vehicle> findByAvailable(Boolean available);

    List<Vehicle> findByCategory(VehicleCategory category);

    List<Vehicle> findByStatus(VehicleStatus status);
}