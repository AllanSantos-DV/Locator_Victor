package com.carrent.application.mapper;

import com.carrent.application.dto.CustomerDTO;
import com.carrent.domain.entity.Customer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CustomerMapperTest {

    @Autowired
    private CustomerMapper customerMapper;

    private CustomerDTO customerDTO;
    private Customer customer;

    @BeforeEach
    void setUp() {
        customerDTO = CustomerDTO.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@email.com")
                .phone("(11) 99999-9999")
                .document("123.456.789-00")
                .address("Rua das Flores, 123")
                .build();

        customer = Customer.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@email.com")
                .phone("(11) 99999-9999")
                .document("123.456.789-00")
                .address("Rua das Flores, 123")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void toEntity_ShouldMapDTOToEntity() {
        Customer mappedEntity = customerMapper.toEntity(customerDTO);

        assertThat(mappedEntity).isNotNull();
        assertThat(mappedEntity.getId()).isNull(); // ID deve ser ignorado
        assertThat(mappedEntity.getName()).isEqualTo(customerDTO.getName());
        assertThat(mappedEntity.getEmail()).isEqualTo(customerDTO.getEmail());
        assertThat(mappedEntity.getPhone()).isEqualTo(customerDTO.getPhone());
        assertThat(mappedEntity.getDocument()).isEqualTo(customerDTO.getDocument());
        assertThat(mappedEntity.getAddress()).isEqualTo(customerDTO.getAddress());
        assertThat(mappedEntity.getCreatedAt()).isNull(); // createdAt deve ser ignorado
        assertThat(mappedEntity.getUpdatedAt()).isNull(); // updatedAt deve ser ignorado
    }

    @Test
    void toDTO_ShouldMapEntityToDTO() {
        CustomerDTO mappedDTO = customerMapper.toDTO(customer);

        assertThat(mappedDTO).isNotNull();
        assertThat(mappedDTO.getId()).isEqualTo(customer.getId());
        assertThat(mappedDTO.getName()).isEqualTo(customer.getName());
        assertThat(mappedDTO.getEmail()).isEqualTo(customer.getEmail());
        assertThat(mappedDTO.getPhone()).isEqualTo(customer.getPhone());
        assertThat(mappedDTO.getDocument()).isEqualTo(customer.getDocument());
        assertThat(mappedDTO.getAddress()).isEqualTo(customer.getAddress());
    }

    @Test
    void toDTOList_ShouldMapEntityListToDTOList() {
        List<Customer> customers = Arrays.asList(customer);
        List<CustomerDTO> mappedDTOs = customerMapper.toDTOList(customers);

        assertThat(mappedDTOs).isNotNull().hasSize(1);
        assertThat(mappedDTOs.get(0).getId()).isEqualTo(customer.getId());
        assertThat(mappedDTOs.get(0).getName()).isEqualTo(customer.getName());
        assertThat(mappedDTOs.get(0).getEmail()).isEqualTo(customer.getEmail());
        assertThat(mappedDTOs.get(0).getPhone()).isEqualTo(customer.getPhone());
        assertThat(mappedDTOs.get(0).getDocument()).isEqualTo(customer.getDocument());
        assertThat(mappedDTOs.get(0).getAddress()).isEqualTo(customer.getAddress());
    }

    @Test
    void updateEntity_ShouldUpdateEntityWithDTOValues() {
        CustomerDTO updateDTO = CustomerDTO.builder()
                .name("Maria Santos")
                .email("maria@email.com")
                .phone("(11) 98888-8888")
                .document("987.654.321-00")
                .address("Avenida Principal, 456")
                .build();

        customerMapper.updateEntity(customer, updateDTO);

        assertThat(customer.getName()).isEqualTo(updateDTO.getName());
        assertThat(customer.getEmail()).isEqualTo(updateDTO.getEmail());
        assertThat(customer.getPhone()).isEqualTo(updateDTO.getPhone());
        assertThat(customer.getDocument()).isEqualTo(updateDTO.getDocument());
        assertThat(customer.getAddress()).isEqualTo(updateDTO.getAddress());
    }

    @Test
    void updateEntity_WithNullValues_ShouldNotUpdateEntity() {
        CustomerDTO updateDTO = CustomerDTO.builder()
                .name(null)
                .email(null)
                .phone(null)
                .document(null)
                .address(null)
                .build();

        customerMapper.updateEntity(customer, updateDTO);

        assertThat(customer.getName()).isEqualTo(customerDTO.getName());
        assertThat(customer.getEmail()).isEqualTo(customerDTO.getEmail());
        assertThat(customer.getPhone()).isEqualTo(customerDTO.getPhone());
        assertThat(customer.getDocument()).isEqualTo(customerDTO.getDocument());
        assertThat(customer.getAddress()).isEqualTo(customerDTO.getAddress());
    }
}