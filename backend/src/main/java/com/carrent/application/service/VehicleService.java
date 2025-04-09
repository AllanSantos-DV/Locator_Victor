package com.carrent.application.service;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.application.mapper.VehicleMapper;
import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.entity.VehicleCategory;
import com.carrent.domain.entity.VehicleStatus;
import com.carrent.domain.exception.DuplicateResourceException;
import com.carrent.domain.exception.VehicleNotFoundException;
import com.carrent.domain.repository.VehicleRepository;
import com.carrent.infrastructure.metrics.CustomMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final CustomMetricsService metricsService;

    @Transactional(readOnly = true)
    public List<VehicleDTO> findAll() {
        return vehicleMapper.toDTOList(vehicleRepository.findAll());
    }

    @Transactional(readOnly = true)
    public VehicleDTO findById(Long id) {
        return vehicleMapper.toDTO(findVehicleById(id));
    }

    @Transactional(readOnly = true)
    public VehicleDTO findByPlate(String plate) {
        return vehicleRepository.findByPlate(plate)
                .map(vehicleMapper::toDTO)
                .orElseThrow(() -> new VehicleNotFoundException(plate));
    }

    @Transactional(readOnly = true)
    public List<VehicleDTO> findAvailable() {
        List<VehicleDTO> availableVehicles = vehicleMapper.toDTOList(vehicleRepository.findByAvailableTrue());
        metricsService.setAvailableVehicles(availableVehicles.size());
        return availableVehicles;
    }

    @Transactional(readOnly = true)
    public List<VehicleDTO> findByCategory(VehicleCategory category) {
        return vehicleMapper.toDTOList(vehicleRepository.findByCategoryAndAvailableTrue(category));
    }

    @Transactional
    public VehicleDTO create(VehicleDTO vehicleDTO) {
        Vehicle vehicle = vehicleMapper.toEntity(vehicleDTO);
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setAvailable(true);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toDTO(savedVehicle);
    }

    @Transactional
    public VehicleDTO update(Long id, VehicleDTO vehicleDTO) {
        Vehicle vehicle = findVehicleById(id);
        vehicleMapper.updateEntity(vehicle, vehicleDTO);

        // Atualizar disponibilidade baseado no status
        vehicle.setAvailable(vehicle.getStatus() == VehicleStatus.AVAILABLE);

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toDTO(updatedVehicle);
    }

    @Transactional
    public void delete(Long id) {
        Vehicle vehicle = findVehicleById(id);

        // Validar se o veículo está disponível
        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new IllegalStateException("Apenas veículos com status DISPONÍVEL podem ser excluídos");
        }

        vehicleRepository.delete(vehicle);
    }

    @Transactional
    public VehicleDTO updateAvailability(Long id, boolean available) {
        Vehicle vehicle = findVehicleById(id);
        vehicle.setAvailable(available);

        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toDTO(updatedVehicle);
    }

    @Transactional
    public VehicleDTO updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = findVehicleById(id);
        vehicle.setStatus(status);
        vehicle.setAvailable(status == VehicleStatus.AVAILABLE);
        Vehicle updatedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toDTO(updatedVehicle);
    }

    private Vehicle findVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException(id));
    }

    private void validatePlateUniqueness(String plate) {
        if (vehicleRepository.existsByPlate(plate)) {
            throw new DuplicateResourceException("Já existe um veículo cadastrado com esta placa");
        }
    }
}