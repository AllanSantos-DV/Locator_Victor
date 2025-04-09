package com.carrent.application.mapper;

import com.carrent.application.dto.RentalDTO;
import com.carrent.domain.entity.Rental;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RentalMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "customer", ignore = true)
    Rental toEntity(RentalDTO dto);

    @Mapping(target = "vehiclePlate", source = "vehicle.plate")
    @Mapping(target = "vehicleId", source = "vehicle.id")
    @Mapping(target = "vehicleBrand", source = "vehicle.brand")
    @Mapping(target = "vehicleModel", source = "vehicle.model")
    @Mapping(target = "vehicleDailyRate", source = "vehicle.dailyRate")
    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    RentalDTO toDTO(Rental entity);

    List<RentalDTO> toDTOList(List<Rental> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "vehicle", ignore = true)
    @Mapping(target = "customer", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Rental entity, RentalDTO dto);
}