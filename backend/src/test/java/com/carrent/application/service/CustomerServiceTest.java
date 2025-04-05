package com.carrent.application.service;

import com.carrent.application.dto.CustomerDTO;
import com.carrent.application.mapper.CustomerMapper;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.exception.CustomerNotFoundException;
import com.carrent.domain.exception.DuplicateResourceException;
import com.carrent.domain.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private CustomerMapper customerMapper;

    @InjectMocks
    private CustomerService customerService;

    private Customer customer;
    private CustomerDTO customerDTO;

    @BeforeEach
    void setUp() {
        customer = Customer.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@email.com")
                .phone("(11) 99999-9999")
                .document("123.456.789-00")
                .address("Rua Teste, 123")
                .build();

        customerDTO = CustomerDTO.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@email.com")
                .phone("(11) 99999-9999")
                .document("123.456.789-00")
                .address("Rua Teste, 123")
                .build();
    }

    @Test
    void findAll_ShouldReturnAllCustomers() {
        List<Customer> customers = Arrays.asList(customer);
        when(customerRepository.findAll()).thenReturn(customers);
        when(customerMapper.toDTOList(customers)).thenReturn(Arrays.asList(customerDTO));

        List<CustomerDTO> result = customerService.findAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(customerDTO.getId(), result.get(0).getId());
        verify(customerRepository).findAll();
    }

    @Test
    void findById_WithValidId_ShouldReturnCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerMapper.toDTO(customer)).thenReturn(customerDTO);

        CustomerDTO result = customerService.findById(1L);

        assertNotNull(result);
        assertEquals(customerDTO.getId(), result.getId());
        assertEquals(customerDTO.getEmail(), result.getEmail());
        verify(customerRepository).findById(1L);
    }

    @Test
    void findById_WithInvalidId_ShouldThrowException() {
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> customerService.findById(1L));
        verify(customerMapper, never()).toDTO(any(Customer.class));
    }

    @Test
    void findByEmail_WithValidEmail_ShouldReturnCustomer() {
        when(customerRepository.findByEmail("joao@email.com")).thenReturn(Optional.of(customer));
        when(customerMapper.toDTO(customer)).thenReturn(customerDTO);

        CustomerDTO result = customerService.findByEmail("joao@email.com");

        assertNotNull(result);
        assertEquals(customerDTO.getEmail(), result.getEmail());
        verify(customerRepository).findByEmail("joao@email.com");
    }

    @Test
    void findByEmail_WithInvalidEmail_ShouldThrowException() {
        when(customerRepository.findByEmail("joao@email.com")).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> customerService.findByEmail("joao@email.com"));
        verify(customerMapper, never()).toDTO(any(Customer.class));
    }

    @Test
    void findByDocument_WithValidDocument_ShouldReturnCustomer() {
        when(customerRepository.findByDocument("123.456.789-00")).thenReturn(Optional.of(customer));
        when(customerMapper.toDTO(customer)).thenReturn(customerDTO);

        CustomerDTO result = customerService.findByDocument("123.456.789-00");

        assertNotNull(result);
        assertEquals(customerDTO.getDocument(), result.getDocument());
        verify(customerRepository).findByDocument("123.456.789-00");
    }

    @Test
    void findByDocument_WithInvalidDocument_ShouldThrowException() {
        when(customerRepository.findByDocument("123.456.789-00")).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> customerService.findByDocument("123.456.789-00"));
        verify(customerMapper, never()).toDTO(any(Customer.class));
    }

    @Test
    void create_WithValidData_ShouldCreateCustomer() {
        when(customerRepository.existsByEmail("joao@email.com")).thenReturn(false);
        when(customerRepository.existsByDocument("123.456.789-00")).thenReturn(false);
        when(customerMapper.toEntity(customerDTO)).thenReturn(customer);
        when(customerRepository.save(customer)).thenReturn(customer);
        when(customerMapper.toDTO(customer)).thenReturn(customerDTO);

        CustomerDTO result = customerService.create(customerDTO);

        assertNotNull(result);
        assertEquals(customerDTO.getId(), result.getId());
        assertEquals(customerDTO.getEmail(), result.getEmail());
        assertEquals(customerDTO.getDocument(), result.getDocument());
        verify(customerRepository).save(customer);
    }

    @Test
    void create_WithDuplicateEmail_ShouldThrowException() {
        when(customerRepository.existsByEmail("joao@email.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> customerService.create(customerDTO));
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void create_WithDuplicateDocument_ShouldThrowException() {
        when(customerRepository.existsByEmail("joao@email.com")).thenReturn(false);
        when(customerRepository.existsByDocument("123.456.789-00")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> customerService.create(customerDTO));
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void update_WithValidData_ShouldUpdateCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.existsByEmail("joao@email.com")).thenReturn(false);
        when(customerRepository.existsByDocument("123.456.789-00")).thenReturn(false);
        when(customerRepository.save(customer)).thenReturn(customer);
        when(customerMapper.toDTO(customer)).thenReturn(customerDTO);

        CustomerDTO result = customerService.update(1L, customerDTO);

        assertNotNull(result);
        assertEquals(customerDTO.getId(), result.getId());
        verify(customerRepository).save(customer);
    }

    @Test
    void update_WithInvalidId_ShouldThrowException() {
        when(customerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> customerService.update(1L, customerDTO));
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void update_WithDuplicateEmail_ShouldThrowException() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.existsByEmail("joao@email.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> customerService.update(1L, customerDTO));
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void update_WithDuplicateDocument_ShouldThrowException() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(customerRepository.existsByEmail("joao@email.com")).thenReturn(false);
        when(customerRepository.existsByDocument("123.456.789-00")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> customerService.update(1L, customerDTO));
        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    void delete_WithValidId_ShouldDeleteCustomer() {
        when(customerRepository.existsById(1L)).thenReturn(true);

        customerService.delete(1L);

        verify(customerRepository).deleteById(1L);
    }

    @Test
    void delete_WithInvalidId_ShouldThrowException() {
        when(customerRepository.existsById(1L)).thenReturn(false);

        assertThrows(CustomerNotFoundException.class, () -> customerService.delete(1L));
        verify(customerRepository, never()).deleteById(anyLong());
    }
}