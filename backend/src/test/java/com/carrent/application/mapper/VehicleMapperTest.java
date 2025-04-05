package com.carrent.application.mapper;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.domain.entity.Vehicle;
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
class VehicleMapperTest {

    @Autowired
    private VehicleMapper vehicleMapper;

    private VehicleDTO vehicleDTO;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        vehicleDTO = VehicleDTO.builder()
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
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void toEntity_ShouldMapDTOToEntity() {
        Vehicle mappedEntity = vehicleMapper.toEntity(vehicleDTO);

        assertThat(mappedEntity).isNotNull();
        assertThat(mappedEntity.getId()).isNull(); // ID deve ser ignorado
        assertThat(mappedEntity.getBrand()).isEqualTo(vehicleDTO.getBrand());
        assertThat(mappedEntity.getModel()).isEqualTo(vehicleDTO.getModel());
        assertThat(mappedEntity.getYear()).isEqualTo(vehicleDTO.getYear());
        assertThat(mappedEntity.getPlate()).isEqualTo(vehicleDTO.getPlate());
        assertThat(mappedEntity.getDailyRate()).isEqualTo(vehicleDTO.getDailyRate());
        assertThat(mappedEntity.getAvailable()).isEqualTo(vehicleDTO.getAvailable());
        assertThat(mappedEntity.getCategory()).isEqualTo(vehicleDTO.getCategory());
        assertThat(mappedEntity.getDescription()).isEqualTo(vehicleDTO.getDescription());
        assertThat(mappedEntity.getCreatedAt()).isNull(); // createdAt deve ser ignorado
        assertThat(mappedEntity.getUpdatedAt()).isNull(); // updatedAt deve ser ignorado
    }

    @Test
    void toDTO_ShouldMapEntityToDTO() {
        VehicleDTO mappedDTO = vehicleMapper.toDTO(vehicle);

        assertThat(mappedDTO).isNotNull();
        assertThat(mappedDTO.getId()).isEqualTo(vehicle.getId());
        assertThat(mappedDTO.getBrand()).isEqualTo(vehicle.getBrand());
        assertThat(mappedDTO.getModel()).isEqualTo(vehicle.getModel());
        assertThat(mappedDTO.getYear()).isEqualTo(vehicle.getYear());
        assertThat(mappedDTO.getPlate()).isEqualTo(vehicle.getPlate());
        assertThat(mappedDTO.getDailyRate()).isEqualTo(vehicle.getDailyRate());
        assertThat(mappedDTO.getAvailable()).isEqualTo(vehicle.getAvailable());
        assertThat(mappedDTO.getCategory()).isEqualTo(vehicle.getCategory());
        assertThat(mappedDTO.getDescription()).isEqualTo(vehicle.getDescription());
    }

    @Test
    void toDTOList_ShouldMapEntityListToDTOList() {
        List<Vehicle> vehicles = Arrays.asList(vehicle);
        List<VehicleDTO> mappedDTOs = vehicleMapper.toDTOList(vehicles);

        assertThat(mappedDTOs).isNotNull().hasSize(1);
        assertThat(mappedDTOs.get(0).getId()).isEqualTo(vehicle.getId());
        assertThat(mappedDTOs.get(0).getBrand()).isEqualTo(vehicle.getBrand());
        assertThat(mappedDTOs.get(0).getModel()).isEqualTo(vehicle.getModel());
        assertThat(mappedDTOs.get(0).getYear()).isEqualTo(vehicle.getYear());
        assertThat(mappedDTOs.get(0).getPlate()).isEqualTo(vehicle.getPlate());
        assertThat(mappedDTOs.get(0).getDailyRate()).isEqualTo(vehicle.getDailyRate());
        assertThat(mappedDTOs.get(0).getAvailable()).isEqualTo(vehicle.getAvailable());
        assertThat(mappedDTOs.get(0).getCategory()).isEqualTo(vehicle.getCategory());
        assertThat(mappedDTOs.get(0).getDescription()).isEqualTo(vehicle.getDescription());
    }

    @Test
    void updateEntity_ShouldUpdateEntityWithDTOValues() {
        VehicleDTO updateDTO = VehicleDTO.builder()
                .brand("Honda")
                .model("Civic")
                .year(2021)
                .plate("XYZ5678")
                .dailyRate(new BigDecimal("120.00"))
                .available(false)
                .category(VehicleCategory.LUXURY)
                .description("Carro premium em excelente estado")
                .build();

        vehicleMapper.updateEntity(vehicle, updateDTO);

        assertThat(vehicle.getBrand()).isEqualTo(updateDTO.getBrand());
        assertThat(vehicle.getModel()).isEqualTo(updateDTO.getModel());
        assertThat(vehicle.getYear()).isEqualTo(updateDTO.getYear());
        assertThat(vehicle.getPlate()).isEqualTo(updateDTO.getPlate());
        assertThat(vehicle.getDailyRate()).isEqualTo(updateDTO.getDailyRate());
        assertThat(vehicle.getAvailable()).isEqualTo(updateDTO.getAvailable());
        assertThat(vehicle.getCategory()).isEqualTo(updateDTO.getCategory());
        assertThat(vehicle.getDescription()).isEqualTo(updateDTO.getDescription());
    }

    @Test
    void updateEntity_WithNullValues_ShouldNotUpdateEntity() {
        VehicleDTO updateDTO = VehicleDTO.builder()
                .brand(null)
                .model(null)
                .year(null)
                .plate(null)
                .dailyRate(null)
                .available(null)
                .category(null)
                .description(null)
                .build();

        vehicleMapper.updateEntity(vehicle, updateDTO);

        assertThat(vehicle.getBrand()).isEqualTo(vehicleDTO.getBrand());
        assertThat(vehicle.getModel()).isEqualTo(vehicleDTO.getModel());
        assertThat(vehicle.getYear()).isEqualTo(vehicleDTO.getYear());
        assertThat(vehicle.getPlate()).isEqualTo(vehicleDTO.getPlate());
        assertThat(vehicle.getDailyRate()).isEqualTo(vehicleDTO.getDailyRate());
        assertThat(vehicle.getAvailable()).isEqualTo(vehicleDTO.getAvailable());
        assertThat(vehicle.getCategory()).isEqualTo(vehicleDTO.getCategory());
        assertThat(vehicle.getDescription()).isEqualTo(vehicleDTO.getDescription());
    }
}