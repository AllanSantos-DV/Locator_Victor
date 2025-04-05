package com.carrent.application.mapper;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.domain.entity.Vehicle;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VehicleMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Vehicle toEntity(VehicleDTO dto);

    @Mapping(target = "status", source = "status")
    VehicleDTO toDTO(Vehicle entity);

    List<VehicleDTO> toDTOList(List<Vehicle> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Vehicle entity, VehicleDTO dto);
}