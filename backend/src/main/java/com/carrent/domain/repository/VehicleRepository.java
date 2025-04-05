package com.carrent.domain.repository;

import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.entity.VehicleCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByPlate(String plate);

    List<Vehicle> findByAvailableTrue();

    List<Vehicle> findByCategoryAndAvailableTrue(VehicleCategory category);

    boolean existsByPlate(String plate);

    Optional<Vehicle> findVehicleByPlate(String plate);
}