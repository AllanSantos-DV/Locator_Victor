package com.carrent.integration;

import com.carrent.application.dto.CustomerDTO;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class CustomerIntegrationTest extends BaseIntegrationTest {

    @Test
    void shouldCreateCustomer() throws Exception {
        CustomerDTO request = CustomerDTO.builder()
                .name("John Doe")
                .email("john@example.com")
                .document("123.456.789-00")
                .phone("(11) 99999-9999")
                .build();

        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john@example.com"))
                .andExpect(jsonPath("$.document").value("123.456.789-00"));
    }

    @Test
    void shouldNotCreateCustomerWithDuplicateEmail() throws Exception {
        // Primeiro cliente
        CustomerDTO firstCustomer = CustomerDTO.builder()
                .name("John Doe")
                .email("john@example.com")
                .document("123.456.789-00")
                .phone("(11) 99999-9999")
                .build();

        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstCustomer)))
                .andExpect(status().isCreated());

        // Tentativa de criar cliente com mesmo email
        CustomerDTO secondCustomer = CustomerDTO.builder()
                .name("Jane Doe")
                .email("john@example.com")
                .document("987.654.321-00")
                .phone("(11) 98888-8888")
                .build();

        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(secondCustomer)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Email já está em uso"));
    }

    @Test
    void shouldNotCreateCustomerWithDuplicateDocument() throws Exception {
        // Primeiro cliente
        CustomerDTO firstCustomer = CustomerDTO.builder()
                .name("John Doe")
                .email("john@example.com")
                .document("123.456.789-00")
                .phone("(11) 99999-9999")
                .build();

        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(firstCustomer)))
                .andExpect(status().isCreated());

        // Tentativa de criar cliente com mesmo documento
        CustomerDTO secondCustomer = CustomerDTO.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .document("123.456.789-00")
                .phone("(11) 98888-8888")
                .build();

        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(secondCustomer)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Documento já está em uso"));
    }

    @Test
    void shouldUpdateCustomer() throws Exception {
        // Criar cliente
        CustomerDTO createRequest = CustomerDTO.builder()
                .name("John Doe")
                .email("john@example.com")
                .document("123.456.789-00")
                .phone("(11) 99999-9999")
                .build();

        String response = mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        CustomerDTO createdCustomer = objectMapper.readValue(response, CustomerDTO.class);

        // Atualizar cliente
        CustomerDTO updateRequest = CustomerDTO.builder()
                .name("John Doe Updated")
                .email("john@example.com")
                .document("123.456.789-00")
                .phone("(11) 98888-8888")
                .build();

        mockMvc.perform(put("/api/customers/" + createdCustomer.getId())
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe Updated"))
                .andExpect(jsonPath("$.phone").value("(11) 98888-8888"));
    }

    @Test
    void shouldDeleteCustomer() throws Exception {
        // Criar cliente
        CustomerDTO createRequest = CustomerDTO.builder()
                .name("John Doe")
                .email("john@example.com")
                .document("123.456.789-00")
                .phone("(11) 99999-9999")
                .build();

        String response = mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        CustomerDTO createdCustomer = objectMapper.readValue(response, CustomerDTO.class);

        // Deletar cliente
        mockMvc.perform(delete("/api/customers/" + createdCustomer.getId())
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNoContent());

        // Tentar buscar cliente deletado
        mockMvc.perform(get("/api/customers/" + createdCustomer.getId())
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldListCustomers() throws Exception {
        // Criar alguns clientes
        CustomerDTO customer1 = CustomerDTO.builder()
                .name("John Doe")
                .email("john@example.com")
                .document("123.456.789-00")
                .phone("(11) 99999-9999")
                .build();

        CustomerDTO customer2 = CustomerDTO.builder()
                .name("Jane Doe")
                .email("jane@example.com")
                .document("987.654.321-00")
                .phone("(11) 98888-8888")
                .build();

        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer1)))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + authToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customer2)))
                .andExpect(status().isCreated());

        // Listar clientes
        mockMvc.perform(get("/api/customers")
                .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }
}