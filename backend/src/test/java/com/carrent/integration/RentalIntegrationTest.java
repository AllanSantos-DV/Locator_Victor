package com.carrent.integration;

import com.carrent.application.dto.CustomerDTO;
import com.carrent.application.dto.RentalDTO;
import com.carrent.application.dto.VehicleDTO;
import com.carrent.domain.entity.RentalStatus;
import com.carrent.domain.entity.VehicleCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class RentalIntegrationTest extends BaseIntegrationTest {

        private Long customerId;
        private Long vehicleId;

        @BeforeEach
        void setUp() throws Exception {
                super.setUp();

                // Criar cliente
                CustomerDTO customer = CustomerDTO.builder()
                                .name("John Doe")
                                .email("john@example.com")
                                .document("123.456.789-00")
                                .phone("(11) 99999-9999")
                                .build();

                String customerResponse = mockMvc.perform(post("/api/customers")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(customer)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                customerId = objectMapper.readValue(customerResponse, CustomerDTO.class).getId();

                // Criar veículo
                VehicleDTO vehicle = VehicleDTO.builder()
                                .brand("Toyota")
                                .model("Corolla")
                                .year(2022)
                                .plate("ABC1234")
                                .category(VehicleCategory.STANDARD)
                                .dailyRate(new BigDecimal("100.00"))
                                .available(true)
                                .build();

                String vehicleResponse = mockMvc.perform(post("/api/vehicles")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(vehicle)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                vehicleId = objectMapper.readValue(vehicleResponse, VehicleDTO.class).getId();
        }

        @Test
        void shouldCreateRental() throws Exception {
                RentalDTO request = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").exists())
                                .andExpect(jsonPath("$.status").value("PENDING"))
                                .andExpect(jsonPath("$.totalAmount").exists());
        }

        @Test
        void shouldNotCreateRentalWithUnavailableVehicle() throws Exception {
                // Primeira locação
                RentalDTO firstRental = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(firstRental)))
                                .andExpect(status().isCreated());

                // Tentativa de criar segunda locação com mesmo veículo
                RentalDTO secondRental = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now().plusDays(1))
                                .endDate(LocalDateTime.now().plusDays(4))
                                .build();

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(secondRental)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("O veículo não está disponível para o período solicitado"));
        }

        @Test
        void shouldNotCreateRentalWithInvalidDates() throws Exception {
                // Data de início no passado
                RentalDTO pastStartDate = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now().minusDays(1))
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(pastStartDate)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message").value("A data de início não pode ser no passado"));

                // Data de término anterior à data de início
                RentalDTO invalidEndDate = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().minusDays(1))
                                .build();

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidEndDate)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("A data de término deve ser posterior à data de início"));
        }

        @Test
        void shouldStartRental() throws Exception {
                // Criar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Iniciar locação
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/start")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        }

        @Test
        void shouldNotStartNonPendingRental() throws Exception {
                // Criar e iniciar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Iniciar locação
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/start")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk());

                // Tentar iniciar novamente
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/start")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Apenas locações pendentes podem ser iniciadas"));
        }

        @Test
        void shouldCompleteRental() throws Exception {
                // Criar e iniciar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Iniciar locação
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/start")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk());

                // Finalizar locação
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/complete")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("COMPLETED"))
                                .andExpect(jsonPath("$.actualReturnDate").exists());
        }

        @Test
        void shouldNotCompleteNonInProgressRental() throws Exception {
                // Criar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Tentar finalizar locação pendente
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/complete")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Apenas locações em andamento podem ser finalizadas"));
        }

        @Test
        void shouldCancelRental() throws Exception {
                // Criar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Cancelar locação
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/cancel")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status").value("CANCELLED"));
        }

        @Test
        void shouldNotCancelNonPendingRental() throws Exception {
                // Criar e iniciar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Iniciar locação
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/start")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk());

                // Tentar cancelar locação em andamento
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/cancel")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Apenas locações pendentes podem ser canceladas"));
        }

        @Test
        void shouldUpdateRental() throws Exception {
                // Criar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Atualizar locação
                RentalDTO updateRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(5))
                                .build();

                mockMvc.perform(put("/api/rentals/" + createdRental.getId())
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.endDate").exists())
                                .andExpect(jsonPath("$.totalAmount").exists());
        }

        @Test
        void shouldNotUpdateNonPendingRental() throws Exception {
                // Criar e iniciar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Iniciar locação
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/start")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk());

                // Tentar atualizar locação em andamento
                RentalDTO updateRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(5))
                                .build();

                mockMvc.perform(put("/api/rentals/" + createdRental.getId())
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(updateRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Não é possível atualizar uma locação que não está pendente"));
        }

        @Test
        void shouldDeleteRental() throws Exception {
                // Criar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Excluir locação
                mockMvc.perform(delete("/api/rentals/" + createdRental.getId())
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isNoContent());
        }

        @Test
        void shouldNotDeleteNonPendingRental() throws Exception {
                // Criar e iniciar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Iniciar locação
                mockMvc.perform(post("/api/rentals/" + createdRental.getId() + "/start")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk());

                // Tentar excluir locação em andamento
                mockMvc.perform(delete("/api/rentals/" + createdRental.getId())
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.message")
                                                .value("Apenas locações pendentes podem ser excluídas"));
        }

        @Test
        void shouldFindRentalById() throws Exception {
                // Criar locação
                RentalDTO createRequest = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                String response = mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(createRequest)))
                                .andExpect(status().isCreated())
                                .andReturn()
                                .getResponse()
                                .getContentAsString();

                RentalDTO createdRental = objectMapper.readValue(response, RentalDTO.class);

                // Buscar locação por ID
                mockMvc.perform(get("/api/rentals/" + createdRental.getId())
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id").value(createdRental.getId()))
                                .andExpect(jsonPath("$.status").value("PENDING"));
        }

        @Test
        void shouldFindRentalsByCustomer() throws Exception {
                // Criar algumas locações para o mesmo cliente
                RentalDTO rental1 = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                RentalDTO rental2 = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now().plusDays(5))
                                .endDate(LocalDateTime.now().plusDays(8))
                                .build();

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(rental1)))
                                .andExpect(status().isCreated());

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(rental2)))
                                .andExpect(status().isCreated());

                // Buscar locações do cliente
                mockMvc.perform(get("/api/rentals/customer/" + customerId)
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        void shouldFindRentalsByVehicle() throws Exception {
                // Criar algumas locações para o mesmo veículo
                RentalDTO rental1 = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                RentalDTO rental2 = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now().plusDays(5))
                                .endDate(LocalDateTime.now().plusDays(8))
                                .build();

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(rental1)))
                                .andExpect(status().isCreated());

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(rental2)))
                                .andExpect(status().isCreated());

                // Buscar locações do veículo
                mockMvc.perform(get("/api/rentals/vehicle/" + vehicleId)
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$.length()").value(2));
        }

        @Test
        void shouldListAllRentals() throws Exception {
                // Criar algumas locações
                RentalDTO rental1 = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now())
                                .endDate(LocalDateTime.now().plusDays(3))
                                .build();

                RentalDTO rental2 = RentalDTO.builder()
                                .customerId(customerId)
                                .vehicleId(vehicleId)
                                .startDate(LocalDateTime.now().plusDays(5))
                                .endDate(LocalDateTime.now().plusDays(8))
                                .build();

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(rental1)))
                                .andExpect(status().isCreated());

                mockMvc.perform(post("/api/rentals")
                                .header("Authorization", "Bearer " + authToken)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(rental2)))
                                .andExpect(status().isCreated());

                // Listar todas as locações
                mockMvc.perform(get("/api/rentals")
                                .header("Authorization", "Bearer " + authToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$").isArray())
                                .andExpect(jsonPath("$.length()").value(2));
        }
}