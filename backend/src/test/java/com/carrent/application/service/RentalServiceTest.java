package com.carrent.application.service;

import com.carrent.application.dto.RentalDTO;
import com.carrent.application.mapper.RentalMapper;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.entity.VehicleStatus;
import com.carrent.domain.exception.CustomerNotFoundException;
import com.carrent.domain.exception.RentalNotFoundException;
import com.carrent.domain.exception.VehicleNotAvailableException;
import com.carrent.domain.repository.CustomerRepository;
import com.carrent.domain.repository.RentalRepository;
import com.carrent.domain.repository.VehicleRepository;
import com.carrent.infrastructure.metrics.CustomMetricsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private RentalMapper rentalMapper;

    @Mock
    private CustomMetricsService metricsService;

    @InjectMocks
    private RentalService rentalService;

    private Vehicle vehicle;
    private Customer customer;
    private Rental rental;
    private RentalDTO rentalDTO;

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
                .build();

        customer = Customer.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@email.com")
                .phone("(11) 99999-9999")
                .document("123.456.789-00")
                .address("Rua Teste, 123")
                .build();

        LocalDateTime now = LocalDateTime.now();
        rental = Rental.builder()
                .id(1L)
                .vehicle(vehicle)
                .customer(customer)
                .startDate(now.plusDays(1))
                .endDate(now.plusDays(5))
                .status(RentalStatus.PENDING)
                .totalAmount(new BigDecimal("500.00"))
                .build();

        rentalDTO = RentalDTO.builder()
                .id(1L)
                .vehicleId(1L)
                .customerId(1L)
                .startDate(now.plusDays(1))
                .endDate(now.plusDays(5))
                .status(RentalStatus.PENDING)
                .totalAmount(new BigDecimal("500.00"))
                .build();
    }

    @Test
    void create_WithValidData_ShouldCreateRental() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(rentalMapper.toEntity(any(RentalDTO.class))).thenReturn(rental);
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);
        when(rentalMapper.toDTO(any(Rental.class))).thenReturn(rentalDTO);
        when(vehicleRepository.findByPlate(anyString())).thenReturn(Optional.of(vehicle));

        RentalDTO result = rentalService.create(rentalDTO);

        assertNotNull(result);
        assertEquals(rentalDTO.getId(), result.getId());
        assertEquals(rentalDTO.getVehicleId(), result.getVehicleId());
        assertEquals(rentalDTO.getCustomerId(), result.getCustomerId());
        assertEquals(rentalDTO.getStatus(), result.getStatus());
        assertEquals(rentalDTO.getTotalAmount(), result.getTotalAmount());

        verify(rentalRepository).save(any(Rental.class));
        verify(vehicleRepository).updateStatus(VehicleStatus.RESERVED, true, vehicle.getId());
    }

    @Test
    void create_WithInvalidVehicleId_ShouldThrowException() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(VehicleNotAvailableException.class, () -> rentalService.create(rentalDTO));
        verify(rentalRepository, never()).save(any(Rental.class));
    }

    @Test
    void create_WithInvalidCustomerId_ShouldThrowException() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> rentalService.create(rentalDTO));
        verify(rentalRepository, never()).save(any(Rental.class));
    }

    @Test
    void startRental_WithValidData_ShouldStartRental() {
        when(rentalRepository.findByIdWithVehicleAndCustomer(1L)).thenReturn(Optional.of(rental));
        doNothing().when(rentalRepository).updateStatus(RentalStatus.IN_PROGRESS, 1L);
        doNothing().when(vehicleRepository).updateStatus(any(VehicleStatus.class), eq(false), eq(1L));

        // Execução
        assertDoesNotThrow(() -> rentalService.startRental(1L));

        // Verificações
        verify(rentalRepository).findByIdWithVehicleAndCustomer(1L);
        verify(rentalRepository).updateStatus(RentalStatus.IN_PROGRESS, 1L);
        verify(vehicleRepository).updateStatus(any(VehicleStatus.class), eq(false), eq(1L));
    }

    @Test
    void startRental_WithInvalidId_ShouldThrowException() {
        when(rentalRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RentalNotFoundException.class, () -> rentalService.startRental(1L));
        verify(rentalRepository, never()).save(any(Rental.class));
    }

    @Test
    void completeRental_WithValidData_ShouldCompleteRental() {
        rental.setStatus(RentalStatus.IN_PROGRESS);
        when(rentalRepository.findByIdWithVehicleAndCustomer(1L)).thenReturn(Optional.of(rental));
        doNothing().when(rentalRepository).updateStatusAndReturnDate(eq(RentalStatus.COMPLETED),
                any(LocalDateTime.class), eq(1L));
        doNothing().when(vehicleRepository).updateStatus(any(VehicleStatus.class), eq(true), eq(1L));

        // Execução
        assertDoesNotThrow(() -> rentalService.completeRental(1L));

        // Verificações
        verify(rentalRepository).findByIdWithVehicleAndCustomer(1L);
        verify(rentalRepository).updateStatusAndReturnDate(eq(RentalStatus.COMPLETED), any(LocalDateTime.class),
                eq(1L));
        verify(vehicleRepository).updateStatus(any(VehicleStatus.class), eq(true), eq(1L));
    }

    @Test
    void cancelRental_WithValidData_ShouldCancelRental() {
        // Configuração dos mocks
        when(rentalRepository.findByIdWithVehicleAndCustomer(1L)).thenReturn(Optional.of(rental));

        // Execução
        assertDoesNotThrow(() -> rentalService.cancelRental(1L));

        // Verificações
        verify(rentalRepository).findByIdWithVehicleAndCustomer(1L);
        verify(rentalRepository).updateStatus(RentalStatus.CANCELLED, 1L);
        verify(vehicleRepository).updateStatus(any(VehicleStatus.class), eq(true), eq(1L));
    }

    @Test
    void delete_WithValidData_ShouldDeleteRental() {
        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        rentalService.delete(1L);

        verify(rentalRepository).deleteById(1L);
        verify(vehicleRepository).updateStatus(VehicleStatus.AVAILABLE, true, vehicle.getId());
    }

    @Test
    void delete_WithInvalidId_ShouldThrowException() {
        when(rentalRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RentalNotFoundException.class, () -> rentalService.delete(1L));
        verify(rentalRepository, never()).deleteById(anyLong());
    }

    @Test
    void terminateRentalEarly_WithValidData_ShouldTerminateRental() {
        // Configuração
        rental.setStatus(RentalStatus.IN_PROGRESS);
        when(rentalRepository.findByIdWithVehicleAndCustomer(1L)).thenReturn(Optional.of(rental));
        doNothing().when(rentalRepository).updateForEarlyTermination(
                eq(RentalStatus.EARLY_TERMINATED),
                any(LocalDateTime.class),
                any(BigDecimal.class),
                any(BigDecimal.class),
                eq(1L));
        doNothing().when(vehicleRepository).updateStatus(any(VehicleStatus.class), eq(true), eq(1L));

        // Execução
        assertDoesNotThrow(() -> rentalService.terminateRentalEarly(1L));

        // Verificações
        verify(rentalRepository).findByIdWithVehicleAndCustomer(1L);
        verify(rentalRepository).updateForEarlyTermination(
                eq(RentalStatus.EARLY_TERMINATED),
                any(LocalDateTime.class),
                any(BigDecimal.class),
                any(BigDecimal.class),
                eq(1L));
        verify(vehicleRepository).updateStatus(any(VehicleStatus.class), eq(true), eq(1L));
        verify(metricsService).decrementActiveRentals();
    }

    @Test
    void terminateRentalEarly_WithNonInProgressRental_ShouldThrowException() {
        // Configuração - aluguel com status diferente de IN_PROGRESS
        rental.setStatus(RentalStatus.PENDING);
        when(rentalRepository.findByIdWithVehicleAndCustomer(1L)).thenReturn(Optional.of(rental));

        // Execução e verificação
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> rentalService.terminateRentalEarly(1L));

        assertEquals("Apenas locações em andamento podem ser encerradas antecipadamente", exception.getMessage());
    }

    @Test
    void create_WithStartDateTodayAndLessThan2HoursFromNow_ShouldThrowException() {
        // Configuração - aluguel com data de início hoje, mas menos de 2 horas após a
        // hora atual
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lessThan2HoursFromNow = now.plusHours(1); // Apenas 1 hora após o horário atual

        RentalDTO invalidRentalDTO = RentalDTO.builder()
                .id(1L)
                .vehicleId(1L)
                .customerId(1L)
                .startDate(lessThan2HoursFromNow)
                .endDate(now.plusDays(5))
                .status(RentalStatus.PENDING)
                .totalAmount(new BigDecimal("500.00"))
                .build();

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

        // Execução e verificação
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> rentalService.create(invalidRentalDTO));

        assertEquals(
                "Para aluguéis que iniciam hoje, o horário de início deve ser pelo menos 2 horas após o horário atual",
                exception.getMessage());
        verify(rentalRepository, never()).save(any(Rental.class));
    }

    @Test
    void update_WithValidData_ShouldUpdateRentalAndVehicleStatus() {
        // Configuração dos mocks
        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));
        when(vehicleRepository.findByPlate(anyString())).thenReturn(Optional.of(vehicle));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);
        when(rentalMapper.toDTO(any(Rental.class))).thenReturn(rentalDTO);

        // Execução
        RentalDTO result = rentalService.update(1L, rentalDTO);

        // Verificações
        assertNotNull(result);
        assertEquals(rentalDTO.getId(), result.getId());
        verify(rentalRepository).save(any(Rental.class));
        // Verificar se o método updateStatus foi chamado com os parâmetros corretos
        verify(vehicleRepository).updateStatus(VehicleStatus.RENTED, false, vehicle.getId());
    }

    @Test
    void create_WithValidData_ShouldUpdateVehicleToReservedStatus() {
        // Configuração
        when(vehicleRepository.findByPlate(anyString())).thenReturn(Optional.of(vehicle));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(rentalMapper.toEntity(any(RentalDTO.class))).thenReturn(rental);
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);
        when(rentalMapper.toDTO(any(Rental.class))).thenReturn(rentalDTO);

        // Execução
        rentalService.create(rentalDTO);

        // Verificação
        verify(vehicleRepository).updateStatus(VehicleStatus.RESERVED, true, vehicle.getId());
    }
}