package com.carrent.integration;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.domain.entity.VehicleCategory;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class VehicleIntegrationTest extends BaseIntegrationTest {

        @Test
        void shouldCreateVehicle() throws Exception {
                VehicleDTO request = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.brand").value("Toyota"))
                                .andExpect(jsonPath("$.model").value("Corolla"))
                                .andExpect(jsonPath("$.year").value(2022))
                                .andExpect(jsonPath("$.plate").value("ABC1234"))
                                .andExpect(jsonPath("$.category").value("STANDARD"))
                                .andExpect(jsonPath("$.dailyRate").value("100.00"))
                                .andExpect(jsonPath("$.available").value(true));
        }

        @Test
        void shouldNotCreateVehicleWithDuplicatePlate() throws Exception {
                // Primeiro veículo
                VehicleDTO firstVehicle = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(firstVehicle)))
                                .andExpect(status().isCreated());

                // Tentativa de criar veículo com mesma placa
                VehicleDTO secondVehicle = VehicleDTO.builder()
                                .brand("Honda")
                                .model("Civic")
                                .year(2023)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("120.00"))
                                .description("Veículo seminovo")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(secondVehicle)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.message")
                                                .value("Já existe um veículo cadastrado com esta placa"));
        }

        @Test
        void shouldUpdateVehicle() throws Exception {
                // Criar veículo
                VehicleDTO createRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                String response = mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                VehicleDTO createdVehicle = objectMapper.readValue(response, VehicleDTO.class);

                // Atualizar veículo
                VehicleDTO updateRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("120.00"))
                                .description("Veículo em excelente estado, com revisão recente")
                                .build();

                mockMvc.perform(put("/api/vehicles/" + createdVehicle.getId())
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.dailyRate").value("120.00"))
                                .andExpect(jsonPath("$.description")
                                                .value("Veículo em excelente estado, com revisão recente"));
        }

        @Test
        void shouldUpdateVehiclePlate() throws Exception {
                // Criar veículo
                VehicleDTO createRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                String response = mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                VehicleDTO createdVehicle = objectMapper.readValue(response, VehicleDTO.class);

                // Atualizar placa
                VehicleDTO updateRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("XYZ5678")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(put("/api/vehicles/" + createdVehicle.getId())
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.plate").value("XYZ5678"));
        }

        @Test
        void shouldNotUpdateVehicleWithDuplicatePlate() throws Exception {
                // Criar primeiro veículo
                VehicleDTO firstVehicle = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(firstVehicle)))
                                .andExpect(status().isCreated());

                // Criar segundo veículo
                VehicleDTO secondVehicle = VehicleDTO.builder()
                                .brand("Honda")
                                .model("Civic")
                                .year(2023)
                                .plate("XYZ5678")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("120.00"))
                                .description("Veículo seminovo")
                                .build();

                String response = mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(secondVehicle)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                VehicleDTO createdSecondVehicle = objectMapper.readValue(response, VehicleDTO.class);

                // Tentar atualizar segundo veículo com placa do primeiro
                VehicleDTO updateRequest = VehicleDTO.builder()
                                .brand("Honda")
                                .model("Civic")
                                .year(2023)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("120.00"))
                                .description("Veículo seminovo")
                                .build();

                mockMvc.perform(put("/api/vehicles/" + createdSecondVehicle.getId())
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.message")
                                                .value("Já existe um veículo cadastrado com esta placa"));
        }

        @Test
        void shouldDeleteVehicle() throws Exception {
                // Criar veículo
                VehicleDTO createRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                String response = mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                VehicleDTO createdVehicle = objectMapper.readValue(response, VehicleDTO.class);

                // Deletar veículo
                mockMvc.perform(delete("/api/vehicles/" + createdVehicle.getId())
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isNoContent());

                // Tentar buscar veículo deletado
                mockMvc.perform(get("/api/vehicles/" + createdVehicle.getId())
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isNotFound());
        }

        @Test
        void shouldListVehicles() throws Exception {
                // Criar alguns veículos
                VehicleDTO vehicle1 = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                VehicleDTO vehicle2 = VehicleDTO.builder()
                                .brand("Honda")
                                .model("Civic")
                                .year(2023)
                                .plate("XYZ5678")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("120.00"))
                                .description("Veículo seminovo")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vehicle1)))
                                .andExpect(status().isCreated());

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vehicle2)))
                                .andExpect(status().isCreated());

                // Listar veículos
                mockMvc.perform(get("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        void shouldFindVehicleByPlate() throws Exception {
                // Criar veículo
                VehicleDTO createRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated());

                // Buscar veículo por placa
                mockMvc.perform(get("/api/vehicles/plate/ABC1234")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.plate").value("ABC1234"))
                                .andExpect(jsonPath("$.brand").value("Toyota"))
                                .andExpect(jsonPath("$.model").value("Corolla"));
        }

        @Test
        void shouldNotFindVehicleByInvalidPlate() throws Exception {
                mockMvc.perform(get("/api/vehicles/plate/INVALID")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isNotFound());
        }

        @Test
        void shouldListAvailableVehicles() throws Exception {
                // Criar veículos
                VehicleDTO vehicle1 = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                VehicleDTO vehicle2 = VehicleDTO.builder()
                                .brand("Honda")
                                .model("Civic")
                                .year(2023)
                                .plate("XYZ5678")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("120.00"))
                                .description("Veículo seminovo")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vehicle1)))
                                .andExpect(status().isCreated());

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vehicle2)))
                                .andExpect(status().isCreated());

                // Listar veículos disponíveis
                mockMvc.perform(get("/api/vehicles/available")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$[0].available").value(true))
                                .andExpect(jsonPath("$[1].available").value(true));
        }

        @Test
        void shouldListVehiclesByCategory() throws Exception {
                // Criar veículos
                VehicleDTO vehicle1 = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                VehicleDTO vehicle2 = VehicleDTO.builder()
                                .brand("Honda")
                                .model("Civic")
                                .year(2023)
                                .plate("XYZ5678")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("120.00"))
                                .description("Veículo seminovo")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vehicle1)))
                                .andExpect(status().isCreated());

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vehicle2)))
                                .andExpect(status().isCreated());

                // Listar veículos por categoria
                mockMvc.perform(get("/api/vehicles/category/STANDARD")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$[0].category").value("STANDARD"))
                                .andExpect(jsonPath("$[1].category").value("STANDARD"))
                                .andExpect(jsonPath("$[0].available").value(true))
                                .andExpect(jsonPath("$[1].available").value(true));
        }

        @Test
        void shouldUpdateVehicleAvailability() throws Exception {
                // Criar veículo
                VehicleDTO createRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                String response = mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                VehicleDTO createdVehicle = objectMapper.readValue(response, VehicleDTO.class);

                // Atualizar disponibilidade
                mockMvc.perform(patch("/api/vehicles/" + createdVehicle.getId() + "/availability")
                                .header("Authorization", "Bearer " + authToken)
                                .param("available", "false"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.available").value(false));

                // Verificar se veículo não aparece mais na lista de disponíveis
                mockMvc.perform(get("/api/vehicles/available")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$[0].id").value(not(createdVehicle.getId())));
        }

        @Test
        void shouldNotCreateVehicleWithInvalidPlate() throws Exception {
                VehicleDTO request = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("123") // Placa inválida
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void shouldNotCreateVehicleWithInvalidYear() throws Exception {
                VehicleDTO request = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(1899) // Ano inválido
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void shouldNotCreateVehicleWithInvalidDailyRate() throws Exception {
                VehicleDTO request = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("0.00")) // Valor inválido
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void shouldNotCreateVehicleWithMissingRequiredFields() throws Exception {
                VehicleDTO request = VehicleDTO.builder()
                                .brand("") // Campo obrigatório vazio
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void shouldNotUpdateVehicleWithInvalidData() throws Exception {
                // Criar veículo
                VehicleDTO createRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                String response = mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                VehicleDTO createdVehicle = objectMapper.readValue(response, VehicleDTO.class);

                // Tentar atualizar com dados inválidos
                VehicleDTO updateRequest = VehicleDTO.builder()
                                .brand("") // Campo obrigatório vazio
                                .model("Corolla")
                                .year(1899) // Ano inválido
                                .plate("123") // Placa inválida
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("0.00")) // Valor inválido
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(put("/api/vehicles/" + createdVehicle.getId())
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isBadRequest());
        }

        @Test
        void shouldNotUpdateNonExistentVehicle() throws Exception {
                VehicleDTO updateRequest = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .description("Veículo em excelente estado")
                                .build();

                mockMvc.perform(put("/api/vehicles/999999")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isNotFound());
        }

        @Test
        void shouldNotDeleteNonExistentVehicle() throws Exception {
                mockMvc.perform(delete("/api/vehicles/999999")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isNotFound());
        }

        @Test
        void shouldNotUpdateAvailabilityOfNonExistentVehicle() throws Exception {
                mockMvc.perform(patch("/api/vehicles/999999/availability")
                                .header("Authorization", "Bearer " + authToken)
                                .param("available", "false"))
                                .andExpect(status().isNotFound());
        }
}