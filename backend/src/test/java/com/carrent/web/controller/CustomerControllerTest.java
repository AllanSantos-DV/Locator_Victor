package com.carrent.web.controller;

import com.carrent.application.dto.CustomerDTO;
import com.carrent.application.service.CustomerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomerService customerService;

    @Autowired
    private ObjectMapper objectMapper;

    private CustomerDTO customerDTO;

    @BeforeEach
    void setUp() {
        customerDTO = CustomerDTO.builder()
                .id(1L)
                .name("João Silva")
                .email("joao.silva@email.com")
                .document("123.456.789-00")
                .phone("(11) 98765-4321")
                .address("Rua das Flores, 123")
                .build();
    }

    @Test
    void findAll_ShouldReturnAllCustomers() throws Exception {
        List<CustomerDTO> customers = Arrays.asList(customerDTO);
        when(customerService.findAll()).thenReturn(customers);

        mockMvc.perform(get("/api/customers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("João Silva"))
                .andExpect(jsonPath("$[0].email").value("joao.silva@email.com"))
                .andExpect(jsonPath("$[0].document").value("123.456.789-00"))
                .andExpect(jsonPath("$[0].phone").value("(11) 98765-4321"))
                .andExpect(jsonPath("$[0].address").value("Rua das Flores, 123"));

        verify(customerService).findAll();
    }

    @Test
    void findById_WithValidId_ShouldReturnCustomer() throws Exception {
        when(customerService.findById(1L)).thenReturn(customerDTO);

        mockMvc.perform(get("/api/customers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("João Silva"))
                .andExpect(jsonPath("$.email").value("joao.silva@email.com"))
                .andExpect(jsonPath("$.document").value("123.456.789-00"))
                .andExpect(jsonPath("$.phone").value("(11) 98765-4321"))
                .andExpect(jsonPath("$.address").value("Rua das Flores, 123"));

        verify(customerService).findById(1L);
    }

    @Test
    void findByEmail_WithValidEmail_ShouldReturnCustomer() throws Exception {
        when(customerService.findByEmail("joao.silva@email.com")).thenReturn(customerDTO);

        mockMvc.perform(get("/api/customers/email/joao.silva@email.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("João Silva"))
                .andExpect(jsonPath("$.email").value("joao.silva@email.com"))
                .andExpect(jsonPath("$.document").value("123.456.789-00"))
                .andExpect(jsonPath("$.phone").value("(11) 98765-4321"))
                .andExpect(jsonPath("$.address").value("Rua das Flores, 123"));

        verify(customerService).findByEmail("joao.silva@email.com");
    }

    @Test
    void findByDocument_WithValidDocument_ShouldReturnCustomer() throws Exception {
        when(customerService.findByDocument("123.456.789-00")).thenReturn(customerDTO);

        mockMvc.perform(get("/api/customers/document/123.456.789-00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("João Silva"))
                .andExpect(jsonPath("$.email").value("joao.silva@email.com"))
                .andExpect(jsonPath("$.document").value("123.456.789-00"))
                .andExpect(jsonPath("$.phone").value("(11) 98765-4321"))
                .andExpect(jsonPath("$.address").value("Rua das Flores, 123"));

        verify(customerService).findByDocument("123.456.789-00");
    }

    @Test
    void create_WithValidData_ShouldCreateCustomer() throws Exception {
        when(customerService.create(any(CustomerDTO.class))).thenReturn(customerDTO);

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customerDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("João Silva"))
                .andExpect(jsonPath("$.email").value("joao.silva@email.com"))
                .andExpect(jsonPath("$.document").value("123.456.789-00"))
                .andExpect(jsonPath("$.phone").value("(11) 98765-4321"))
                .andExpect(jsonPath("$.address").value("Rua das Flores, 123"));

        verify(customerService).create(any(CustomerDTO.class));
    }

    @Test
    void update_WithValidData_ShouldUpdateCustomer() throws Exception {
        when(customerService.update(eq(1L), any(CustomerDTO.class))).thenReturn(customerDTO);

        mockMvc.perform(put("/api/customers/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(customerDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("João Silva"))
                .andExpect(jsonPath("$.email").value("joao.silva@email.com"))
                .andExpect(jsonPath("$.document").value("123.456.789-00"))
                .andExpect(jsonPath("$.phone").value("(11) 98765-4321"))
                .andExpect(jsonPath("$.address").value("Rua das Flores, 123"));

        verify(customerService).update(eq(1L), any(CustomerDTO.class));
    }

    @Test
    void delete_WithValidId_ShouldDeleteCustomer() throws Exception {
        doNothing().when(customerService).delete(1L);

        mockMvc.perform(delete("/api/customers/1"))
                .andExpect(status().isNoContent());

        verify(customerService).delete(1L);
    }

    @Test
    void create_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        CustomerDTO invalidCustomer = CustomerDTO.builder()
                .name("") // Name cannot be empty
                .email("invalid-email") // Invalid email format
                .document("") // Document cannot be empty
                .phone("") // Phone cannot be empty
                .address("") // Address cannot be empty
                .build();

        mockMvc.perform(post("/api/customers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCustomer)))
                .andExpect(status().isBadRequest());

        verify(customerService, never()).create(any(CustomerDTO.class));
    }
}