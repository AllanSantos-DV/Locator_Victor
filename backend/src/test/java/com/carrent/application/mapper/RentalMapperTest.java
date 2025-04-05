package com.carrent.application.mapper;

import com.carrent.application.dto.RentalDTO;
import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.entity.VehicleCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class RentalMapperTest {

    @Autowired
    private RentalMapper rentalMapper;

    private RentalDTO rentalDTO;
    private Rental rental;
    private Vehicle vehicle;
    private Customer customer;

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
                .category(VehicleCategory.STANDARD)
                .description("Carro em excelente estado")
                .build();

        customer = Customer.builder()
                .id(1L)
                .name("João Silva")
                .email("joao@email.com")
                .phone("(11) 99999-9999")
                .document("123.456.789-00")
                .address("Rua das Flores, 123")
                .build();

        rentalDTO = RentalDTO.builder()
                .id(1L)
                .vehicleId(1L)
                .customerId(1L)
                .startDate(LocalDateTime.now().plusDays(1))
                .endDate(LocalDateTime.now().plusDays(7))
                .status(RentalStatus.PENDING)
                .totalAmount(new BigDecimal("700.00"))
                .build();

        rental = new Rental();
        rental.setId(1L);
        rental.setVehicle(vehicle);
        rental.setCustomer(customer);
        rental.setStartDate(LocalDateTime.now().plusDays(1));
        rental.setEndDate(LocalDateTime.now().plusDays(7));
        rental.setStatus(RentalStatus.PENDING);
        rental.setTotalAmount(new BigDecimal("700.00"));
    }

    @Test
    void toEntity_ShouldMapDTOToEntity() {
        Rental mappedEntity = rentalMapper.toEntity(rentalDTO);

        assertThat(mappedEntity).isNotNull();
        assertThat(mappedEntity.getId()).isNull(); // ID deve ser ignorado
        assertThat(mappedEntity.getVehicle().getId()).isEqualTo(rentalDTO.getVehicleId());
        assertThat(mappedEntity.getCustomer().getId()).isEqualTo(rentalDTO.getCustomerId());
        assertThat(mappedEntity.getStartDate()).isEqualTo(rentalDTO.getStartDate());
        assertThat(mappedEntity.getEndDate()).isEqualTo(rentalDTO.getEndDate());
        assertThat(mappedEntity.getStatus()).isEqualTo(rentalDTO.getStatus());
        assertThat(mappedEntity.getTotalAmount()).isEqualTo(rentalDTO.getTotalAmount());
    }

    @Test
    void toDTO_ShouldMapEntityToDTO() {
        RentalDTO mappedDTO = rentalMapper.toDTO(rental);

        assertThat(mappedDTO).isNotNull();
        assertThat(mappedDTO.getId()).isEqualTo(rental.getId());
        assertThat(mappedDTO.getVehicleId()).isEqualTo(rental.getVehicle().getId());
        assertThat(mappedDTO.getCustomerId()).isEqualTo(rental.getCustomer().getId());
        assertThat(mappedDTO.getStartDate()).isEqualTo(rental.getStartDate());
        assertThat(mappedDTO.getEndDate()).isEqualTo(rental.getEndDate());
        assertThat(mappedDTO.getStatus()).isEqualTo(rental.getStatus());
        assertThat(mappedDTO.getTotalAmount()).isEqualTo(rental.getTotalAmount());
    }

    @Test
    void toDTOList_ShouldMapEntityListToDTOList() {
        List<Rental> rentals = Arrays.asList(rental);
        List<RentalDTO> mappedDTOs = rentalMapper.toDTOList(rentals);

        assertThat(mappedDTOs).isNotNull().hasSize(1);
        assertThat(mappedDTOs.get(0).getId()).isEqualTo(rental.getId());
        assertThat(mappedDTOs.get(0).getVehicleId()).isEqualTo(rental.getVehicle().getId());
        assertThat(mappedDTOs.get(0).getCustomerId()).isEqualTo(rental.getCustomer().getId());
        assertThat(mappedDTOs.get(0).getStartDate()).isEqualTo(rental.getStartDate());
        assertThat(mappedDTOs.get(0).getEndDate()).isEqualTo(rental.getEndDate());
        assertThat(mappedDTOs.get(0).getStatus()).isEqualTo(rental.getStatus());
        assertThat(mappedDTOs.get(0).getTotalAmount()).isEqualTo(rental.getTotalAmount());
    }

    @Test
    void updateEntity_ShouldUpdateEntityWithDTOValues() {
        RentalDTO updateDTO = RentalDTO.builder()
                .vehicleId(2L)
                .customerId(2L)
                .startDate(LocalDateTime.now().plusDays(2))
                .endDate(LocalDateTime.now().plusDays(8))
                .status(RentalStatus.IN_PROGRESS)
                .totalAmount(new BigDecimal("800.00"))
                .build();

        rentalMapper.updateEntity(rental, updateDTO);

        assertThat(rental.getVehicle().getId()).isEqualTo(updateDTO.getVehicleId());
        assertThat(rental.getCustomer().getId()).isEqualTo(updateDTO.getCustomerId());
        assertThat(rental.getStartDate()).isEqualTo(updateDTO.getStartDate());
        assertThat(rental.getEndDate()).isEqualTo(updateDTO.getEndDate());
        assertThat(rental.getStatus()).isEqualTo(updateDTO.getStatus());
        assertThat(rental.getTotalAmount()).isEqualTo(updateDTO.getTotalAmount());
    }

    @Test
    void updateEntity_WithNullValues_ShouldNotUpdateEntity() {
        RentalDTO updateDTO = RentalDTO.builder()
                .vehicleId(null)
                .customerId(null)
                .startDate(null)
                .endDate(null)
                .status(null)
                .totalAmount(null)
                .build();

        rentalMapper.updateEntity(rental, updateDTO);

        assertThat(rental.getVehicle().getId()).isEqualTo(1L);
        assertThat(rental.getCustomer().getId()).isEqualTo(1L);
        assertThat(rental.getStartDate()).isEqualTo(rentalDTO.getStartDate());
        assertThat(rental.getEndDate()).isEqualTo(rentalDTO.getEndDate());
        assertThat(rental.getStatus()).isEqualTo(rentalDTO.getStatus());
        assertThat(rental.getTotalAmount()).isEqualTo(rentalDTO.getTotalAmount());
    }
}