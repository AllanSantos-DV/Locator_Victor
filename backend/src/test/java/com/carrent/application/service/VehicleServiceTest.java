package com.carrent.application.service;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.application.mapper.VehicleMapper;
import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.entity.VehicleCategory;
import com.carrent.domain.exception.DuplicateResourceException;
import com.carrent.domain.exception.VehicleNotFoundException;
import com.carrent.domain.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleMapper vehicleMapper;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle vehicle;
    private VehicleDTO vehicleDTO;

    @BeforeEach
    void setUp() {
        vehicle = Vehicle.builder()
                .id(1L)
                .brand("Toyota")
                .model("Corolla")
                .year(2020)
                .plate("ABC1234")
                .dailyRate(new BigDecimal("100.00"))
                .available(true)
                .category(VehicleCategory.STANDARD)
                .description("Carro em excelente estado")
                .build();

        vehicleDTO = VehicleDTO.builder()
                .id(1L)
                .brand("Toyota")
                .model("Corolla")
                .year(2020)
                .plate("ABC1234")
                .dailyRate(new BigDecimal("100.00"))
                .available(true)
                .category(VehicleCategory.STANDARD)
                .description("Carro em excelente estado")
                .build();
    }

    @Test
    void findAll_ShouldReturnAllVehicles() {
        List<Vehicle> vehicles = Arrays.asList(vehicle);
        when(vehicleRepository.findAll()).thenReturn(vehicles);
        when(vehicleMapper.toDTOList(vehicles)).thenReturn(Arrays.asList(vehicleDTO));

        List<VehicleDTO> result = vehicleService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(vehicleDTO.getId(), result.get(0).getId());
        verify(vehicleRepository).findAll();
    }

    @Test
    void findById_WithValidId_ShouldReturnVehicle() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleMapper.toDTO(vehicle)).thenReturn(vehicleDTO);

        VehicleDTO result = vehicleService.findById(1L);

        assertNotNull(result);
        assertEquals(vehicleDTO.getId(), result.getId());
        assertEquals(vehicleDTO.getPlate(), result.getPlate());
        verify(vehicleRepository).findById(1L);
    }

    @Test
    void findById_WithInvalidId_ShouldThrowException() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class, () -> vehicleService.findById(1L));
        verify(vehicleMapper, never()).toDTO(any(Vehicle.class));
    }

    @Test
    void findByPlate_WithValidPlate_ShouldReturnVehicle() {
        when(vehicleRepository.findByPlate("ABC1234")).thenReturn(Optional.of(vehicle));
        when(vehicleMapper.toDTO(vehicle)).thenReturn(vehicleDTO);

        VehicleDTO result = vehicleService.findByPlate("ABC1234");

        assertNotNull(result);
        assertEquals(vehicleDTO.getPlate(), result.getPlate());
        verify(vehicleRepository).findByPlate("ABC1234");
    }

    @Test
    void findByPlate_WithInvalidPlate_ShouldThrowException() {
        when(vehicleRepository.findByPlate("ABC1234")).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class, () -> vehicleService.findByPlate("ABC1234"));
        verify(vehicleMapper, never()).toDTO(any(Vehicle.class));
    }

    @Test
    void findAvailable_ShouldReturnAvailableVehicles() {
        List<Vehicle> vehicles = Arrays.asList(vehicle);
        when(vehicleRepository.findByAvailableTrue()).thenReturn(vehicles);
        when(vehicleMapper.toDTOList(vehicles)).thenReturn(Arrays.asList(vehicleDTO));

        List<VehicleDTO> result = vehicleService.findAvailable();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getAvailable());
        verify(vehicleRepository).findByAvailableTrue();
    }

    @Test
    void findByCategory_ShouldReturnVehiclesByCategory() {
        List<Vehicle> vehicles = Arrays.asList(vehicle);
        when(vehicleRepository.findByCategoryAndAvailableTrue(VehicleCategory.STANDARD)).thenReturn(vehicles);
        when(vehicleMapper.toDTOList(vehicles)).thenReturn(Arrays.asList(vehicleDTO));

        List<VehicleDTO> result = vehicleService.findByCategory(VehicleCategory.STANDARD);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(VehicleCategory.STANDARD, result.get(0).getCategory());
        verify(vehicleRepository).findByCategoryAndAvailableTrue(VehicleCategory.STANDARD);
    }

    @Test
    void create_WithValidData_ShouldCreateVehicle() {
        when(vehicleRepository.existsByPlate("ABC1234")).thenReturn(false);
        when(vehicleMapper.toEntity(vehicleDTO)).thenReturn(vehicle);
        when(vehicleRepository.save(vehicle)).thenReturn(vehicle);
        when(vehicleMapper.toDTO(vehicle)).thenReturn(vehicleDTO);

        VehicleDTO result = vehicleService.create(vehicleDTO);

        assertNotNull(result);
        assertEquals(vehicleDTO.getId(), result.getId());
        assertEquals(vehicleDTO.getPlate(), result.getPlate());
        assertTrue(result.getAvailable());
        verify(vehicleRepository).save(vehicle);
    }

    @Test
    void create_WithDuplicatePlate_ShouldThrowException() {
        when(vehicleRepository.existsByPlate("ABC1234")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> vehicleService.create(vehicleDTO));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void update_WithValidData_ShouldUpdateVehicle() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.existsByPlate("ABC1234")).thenReturn(false);
        when(vehicleRepository.save(vehicle)).thenReturn(vehicle);
        when(vehicleMapper.toDTO(vehicle)).thenReturn(vehicleDTO);

        VehicleDTO result = vehicleService.update(1L, vehicleDTO);

        assertNotNull(result);
        assertEquals(vehicleDTO.getId(), result.getId());
        verify(vehicleRepository).save(vehicle);
    }

    @Test
    void update_WithInvalidId_ShouldThrowException() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class, () -> vehicleService.update(1L, vehicleDTO));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void update_WithDuplicatePlate_ShouldThrowException() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.existsByPlate("ABC1234")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> vehicleService.update(1L, vehicleDTO));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void delete_WithValidId_ShouldDeleteVehicle() {
        when(vehicleRepository.existsById(1L)).thenReturn(true);

        vehicleService.delete(1L);

        verify(vehicleRepository).deleteById(1L);
    }

    @Test
    void delete_WithInvalidId_ShouldThrowException() {
        when(vehicleRepository.existsById(1L)).thenReturn(false);

        assertThrows(VehicleNotFoundException.class, () -> vehicleService.delete(1L));
        verify(vehicleRepository, never()).deleteById(anyLong());
    }

    @Test
    void updateAvailability_WithValidData_ShouldUpdateAvailability() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(vehicle)).thenReturn(vehicle);
        when(vehicleMapper.toDTO(vehicle)).thenReturn(vehicleDTO);

        VehicleDTO result = vehicleService.updateAvailability(1L, false);

        assertNotNull(result);
        assertFalse(vehicle.getAvailable());
        verify(vehicleRepository).save(vehicle);
    }

    @Test
    void updateAvailability_WithInvalidId_ShouldThrowException() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class, () -> vehicleService.updateAvailability(1L, false));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }
}