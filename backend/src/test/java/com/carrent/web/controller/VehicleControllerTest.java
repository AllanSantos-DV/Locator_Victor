package com.carrent.web.controller;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.application.service.VehicleService;
import com.carrent.domain.entity.VehicleCategory;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(VehicleController.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VehicleService vehicleService;

    @Autowired
    private ObjectMapper objectMapper;

    private VehicleDTO vehicleDTO;

    @BeforeEach
    void setUp() {
        vehicleDTO = VehicleDTO.builder()
                .id(1L)
                .brand("Toyota")
                .model("Corolla")
                .year(2022)
                .plate("ABC1234")
                .category(VehicleCategory.STANDARD)
                .dailyRate(new BigDecimal("100.00"))
                .description("Veículo em excelente estado")
                .available(true)
                .build();
    }

    @Test
    void findAll_ShouldReturnAllVehicles() throws Exception {
        List<VehicleDTO> vehicles = Arrays.asList(vehicleDTO);
        when(vehicleService.findAll()).thenReturn(vehicles);

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].brand").value("Toyota"))
                .andExpect(jsonPath("$[0].model").value("Corolla"))
                .andExpect(jsonPath("$[0].year").value(2022))
                .andExpect(jsonPath("$[0].plate").value("ABC1234"))
                .andExpect(jsonPath("$[0].category").value("STANDARD"))
                .andExpect(jsonPath("$[0].dailyRate").value("100.00"))
                .andExpect(jsonPath("$[0].available").value(true));

        verify(vehicleService).findAll();
    }

    @Test
    void findById_WithValidId_ShouldReturnVehicle() throws Exception {
        when(vehicleService.findById(1L)).thenReturn(vehicleDTO);

        mockMvc.perform(get("/api/vehicles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Corolla"))
                .andExpect(jsonPath("$.year").value(2022))
                .andExpect(jsonPath("$.plate").value("ABC1234"))
                .andExpect(jsonPath("$.category").value("STANDARD"))
                .andExpect(jsonPath("$.dailyRate").value("100.00"))
                .andExpect(jsonPath("$.available").value(true));

        verify(vehicleService).findById(1L);
    }

    @Test
    void findByPlate_WithValidPlate_ShouldReturnVehicle() throws Exception {
        when(vehicleService.findByPlate("ABC1234")).thenReturn(vehicleDTO);

        mockMvc.perform(get("/api/vehicles/plate/ABC1234"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Corolla"))
                .andExpect(jsonPath("$.year").value(2022))
                .andExpect(jsonPath("$.plate").value("ABC1234"))
                .andExpect(jsonPath("$.category").value("STANDARD"))
                .andExpect(jsonPath("$.dailyRate").value("100.00"))
                .andExpect(jsonPath("$.available").value(true));

        verify(vehicleService).findByPlate("ABC1234");
    }

    @Test
    void findAvailable_ShouldReturnAvailableVehicles() throws Exception {
        List<VehicleDTO> vehicles = Arrays.asList(vehicleDTO);
        when(vehicleService.findAvailable()).thenReturn(vehicles);

        mockMvc.perform(get("/api/vehicles/available"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].brand").value("Toyota"))
                .andExpect(jsonPath("$[0].model").value("Corolla"))
                .andExpect(jsonPath("$[0].year").value(2022))
                .andExpect(jsonPath("$[0].plate").value("ABC1234"))
                .andExpect(jsonPath("$[0].category").value("STANDARD"))
                .andExpect(jsonPath("$[0].dailyRate").value("100.00"))
                .andExpect(jsonPath("$[0].available").value(true));

        verify(vehicleService).findAvailable();
    }

    @Test
    void findByCategory_ShouldReturnVehiclesByCategory() throws Exception {
        List<VehicleDTO> vehicles = Arrays.asList(vehicleDTO);
        when(vehicleService.findByCategory(VehicleCategory.STANDARD)).thenReturn(vehicles);

        mockMvc.perform(get("/api/vehicles/category/STANDARD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].brand").value("Toyota"))
                .andExpect(jsonPath("$[0].model").value("Corolla"))
                .andExpect(jsonPath("$[0].year").value(2022))
                .andExpect(jsonPath("$[0].plate").value("ABC1234"))
                .andExpect(jsonPath("$[0].category").value("STANDARD"))
                .andExpect(jsonPath("$[0].dailyRate").value("100.00"))
                .andExpect(jsonPath("$[0].available").value(true));

        verify(vehicleService).findByCategory(VehicleCategory.STANDARD);
    }

    @Test
    void create_WithValidData_ShouldCreateVehicle() throws Exception {
        when(vehicleService.create(any(VehicleDTO.class))).thenReturn(vehicleDTO);

        mockMvc.perform(post("/api/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Corolla"))
                .andExpect(jsonPath("$.year").value(2022))
                .andExpect(jsonPath("$.plate").value("ABC1234"))
                .andExpect(jsonPath("$.category").value("STANDARD"))
                .andExpect(jsonPath("$.dailyRate").value("100.00"))
                .andExpect(jsonPath("$.available").value(true));

        verify(vehicleService).create(any(VehicleDTO.class));
    }

    @Test
    void update_WithValidData_ShouldUpdateVehicle() throws Exception {
        when(vehicleService.update(eq(1L), any(VehicleDTO.class))).thenReturn(vehicleDTO);

        mockMvc.perform(put("/api/vehicles/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Corolla"))
                .andExpect(jsonPath("$.year").value(2022))
                .andExpect(jsonPath("$.plate").value("ABC1234"))
                .andExpect(jsonPath("$.category").value("STANDARD"))
                .andExpect(jsonPath("$.dailyRate").value("100.00"))
                .andExpect(jsonPath("$.available").value(true));

        verify(vehicleService).update(eq(1L), any(VehicleDTO.class));
    }

    @Test
    void delete_WithValidId_ShouldDeleteVehicle() throws Exception {
        doNothing().when(vehicleService).delete(1L);

        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isNoContent());

        verify(vehicleService).delete(1L);
    }

    @Test
    void updateAvailability_WithValidData_ShouldUpdateVehicleAvailability() throws Exception {
        when(vehicleService.updateAvailability(1L, true)).thenReturn(vehicleDTO);

        mockMvc.perform(patch("/api/vehicles/1/availability")
                .param("available", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.brand").value("Toyota"))
                .andExpect(jsonPath("$.model").value("Corolla"))
                .andExpect(jsonPath("$.year").value(2022))
                .andExpect(jsonPath("$.plate").value("ABC1234"))
                .andExpect(jsonPath("$.category").value("STANDARD"))
                .andExpect(jsonPath("$.dailyRate").value("100.00"))
                .andExpect(jsonPath("$.available").value(true));

        verify(vehicleService).updateAvailability(1L, true);
    }

    @Test
    void create_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        VehicleDTO invalidVehicle = VehicleDTO.builder()
                .brand("") // Brand cannot be empty
                .model("") // Model cannot be empty
                .year(2022)
                .plate("") // Plate cannot be empty
                .category(VehicleCategory.STANDARD)
                .dailyRate(new BigDecimal("0")) // Daily rate must be positive
                .description("Veículo em excelente estado")
                .available(true)
                .build();

        mockMvc.perform(post("/api/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidVehicle)))
                .andExpect(status().isBadRequest());

        verify(vehicleService, never()).create(any(VehicleDTO.class));
    }
}