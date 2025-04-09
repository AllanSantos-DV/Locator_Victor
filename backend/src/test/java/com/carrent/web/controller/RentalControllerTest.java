package com.carrent.web.controller;

import com.carrent.application.dto.RentalDTO;
import com.carrent.application.service.RentalService;
import com.carrent.domain.entity.RentalStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RentalController.class)
class RentalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RentalService rentalService;

    @Autowired
    private ObjectMapper objectMapper;

    private RentalDTO rentalDTO;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ISO_DATE_TIME;

    @BeforeEach
    void setUp() {
        rentalDTO = RentalDTO.builder()
                .id(1L)
                .vehicleId(1L)
                .customerId(1L)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(7))
                .status(RentalStatus.PENDING)
                .totalAmount(new BigDecimal("700.00"))
                .build();
    }

    @Test
    void findAll_ShouldReturnAllRentals() throws Exception {
        List<RentalDTO> rentals = Arrays.asList(rentalDTO);
        when(rentalService.findAll()).thenReturn(rentals);

        mockMvc.perform(get("/api/rentals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].vehicleId").value(1))
                .andExpect(jsonPath("$[0].customerId").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].totalAmount").value("700.00"));

        verify(rentalService).findAll();
    }

    @Test
    void findById_WithValidId_ShouldReturnRental() throws Exception {
        when(rentalService.findById(1L)).thenReturn(rentalDTO);

        mockMvc.perform(get("/api/rentals/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.vehicleId").value(1))
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value("700.00"));

        verify(rentalService).findById(1L);
    }

    @Test
    void findByCustomerId_ShouldReturnCustomerRentals() throws Exception {
        List<RentalDTO> rentals = Arrays.asList(rentalDTO);
        when(rentalService.findByCustomerId(1L)).thenReturn(rentals);

        mockMvc.perform(get("/api/rentals/customer/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].vehicleId").value(1))
                .andExpect(jsonPath("$[0].customerId").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].totalAmount").value("700.00"));

        verify(rentalService).findByCustomerId(1L);
    }

    @Test
    void findByVehicleId_ShouldReturnVehicleRentals() throws Exception {
        List<RentalDTO> rentals = Arrays.asList(rentalDTO);
        when(rentalService.findByVehicleId(1L)).thenReturn(rentals);

        mockMvc.perform(get("/api/rentals/vehicle/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].vehicleId").value(1))
                .andExpect(jsonPath("$[0].customerId").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].totalAmount").value("700.00"));

        verify(rentalService).findByVehicleId(1L);
    }

    @Test
    void findByStatus_ShouldReturnRentalsByStatus() throws Exception {
        List<RentalDTO> rentals = Arrays.asList(rentalDTO);
        when(rentalService.findByStatus(RentalStatus.PENDING)).thenReturn(rentals);

        mockMvc.perform(get("/api/rentals/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].vehicleId").value(1))
                .andExpect(jsonPath("$[0].customerId").value(1))
                .andExpect(jsonPath("$[0].status").value("PENDING"))
                .andExpect(jsonPath("$[0].totalAmount").value("700.00"));

        verify(rentalService).findByStatus(RentalStatus.PENDING);
    }

    @Test
    void create_WithValidData_ShouldCreateRental() throws Exception {
        when(rentalService.create(any(RentalDTO.class))).thenReturn(rentalDTO);

        mockMvc.perform(post("/api/rentals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rentalDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.vehicleId").value(1))
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value("700.00"));

        verify(rentalService).create(any(RentalDTO.class));
    }

    @Test
    void update_WithValidData_ShouldUpdateRental() throws Exception {
        when(rentalService.update(eq(1L), any(RentalDTO.class))).thenReturn(rentalDTO);

        mockMvc.perform(put("/api/rentals/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(rentalDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.vehicleId").value(1))
                .andExpect(jsonPath("$.customerId").value(1))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value("700.00"));

        verify(rentalService).update(eq(1L), any(RentalDTO.class));
    }

    @Test
    void startRental_ShouldStartRental() throws Exception {
        mockMvc.perform(patch("/api/rentals/1/start"))
                .andExpect(status().isNoContent());

        verify(rentalService).startRental(1L);
    }

    @Test
    void completeRental_ShouldCompleteRental() throws Exception {
        mockMvc.perform(patch("/api/rentals/1/complete"))
                .andExpect(status().isNoContent());

        verify(rentalService).completeRental(1L);
    }

    @Test
    void cancelRental_ShouldCancelRental() throws Exception {
        mockMvc.perform(patch("/api/rentals/1/cancel"))
                .andExpect(status().isNoContent());

        verify(rentalService).cancelRental(1L);
    }

    @Test
    void create_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        RentalDTO invalidRental = RentalDTO.builder()
                .vehicleId(null) // Vehicle ID cannot be null
                .customerId(null) // Customer ID cannot be null
                .startDate(null) // Start date cannot be null
                .endDate(null) // End date cannot be null
                .status(null) // Status cannot be null
                .totalAmount(null) // Total amount cannot be null
                .build();

        mockMvc.perform(post("/api/rentals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRental)))
                .andExpect(status().isBadRequest());

        verify(rentalService, never()).create(any(RentalDTO.class));
    }
}