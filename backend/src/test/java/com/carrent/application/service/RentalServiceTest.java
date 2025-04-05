package com.carrent.application.service;

import com.carrent.application.dto.RentalDTO;
import com.carrent.application.mapper.RentalMapper;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.exception.CustomerNotFoundException;
import com.carrent.domain.exception.RentalNotFoundException;
import com.carrent.domain.exception.VehicleNotAvailableException;
import com.carrent.domain.repository.CustomerRepository;
import com.carrent.domain.repository.RentalRepository;
import com.carrent.domain.repository.VehicleRepository;
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

        RentalDTO result = rentalService.create(rentalDTO);

        assertNotNull(result);
        assertEquals(rentalDTO.getId(), result.getId());
        assertEquals(rentalDTO.getVehicleId(), result.getVehicleId());
        assertEquals(rentalDTO.getCustomerId(), result.getCustomerId());
        assertEquals(rentalDTO.getStatus(), result.getStatus());
        assertEquals(rentalDTO.getTotalAmount(), result.getTotalAmount());

        verify(rentalRepository).save(any(Rental.class));
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
        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);
        when(rentalMapper.toDTO(any(Rental.class))).thenReturn(rentalDTO);

        RentalDTO result = rentalService.startRental(1L);

        assertNotNull(result);
        assertEquals(RentalStatus.IN_PROGRESS, rental.getStatus());
        assertFalse(rental.getVehicle().getAvailable());

        verify(rentalRepository).save(any(Rental.class));
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
        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);
        when(rentalMapper.toDTO(any(Rental.class))).thenReturn(rentalDTO);

        RentalDTO result = rentalService.completeRental(1L);

        assertNotNull(result);
        assertEquals(RentalStatus.COMPLETED, rental.getStatus());
        assertTrue(rental.getVehicle().getAvailable());
        assertNotNull(rental.getActualReturnDate());

        verify(rentalRepository).save(any(Rental.class));
    }

    @Test
    void completeRental_WithLateReturn_ShouldAddLateFee() {
        rental.setStatus(RentalStatus.IN_PROGRESS);
        rental.setEndDate(LocalDateTime.now().minusDays(2));
        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);
        when(rentalMapper.toDTO(any(Rental.class))).thenReturn(rentalDTO);

        RentalDTO result = rentalService.completeRental(1L);

        assertNotNull(result);
        assertEquals(RentalStatus.COMPLETED, rental.getStatus());
        assertTrue(rental.getTotalAmount().compareTo(new BigDecimal("500.00")) > 0);

        verify(rentalRepository).save(any(Rental.class));
    }

    @Test
    void cancelRental_WithValidData_ShouldCancelRental() {
        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));
        when(rentalRepository.save(any(Rental.class))).thenReturn(rental);
        when(rentalMapper.toDTO(any(Rental.class))).thenReturn(rentalDTO);

        RentalDTO result = rentalService.cancelRental(1L);

        assertNotNull(result);
        assertEquals(RentalStatus.CANCELLED, rental.getStatus());
        assertTrue(rental.getVehicle().getAvailable());

        verify(rentalRepository).save(any(Rental.class));
    }

    @Test
    void delete_WithValidData_ShouldDeleteRental() {
        when(rentalRepository.findById(1L)).thenReturn(Optional.of(rental));

        rentalService.delete(1L);

        verify(rentalRepository).deleteById(1L);
    }

    @Test
    void delete_WithInvalidId_ShouldThrowException() {
        when(rentalRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RentalNotFoundException.class, () -> rentalService.delete(1L));
        verify(rentalRepository, never()).deleteById(anyLong());
    }
}