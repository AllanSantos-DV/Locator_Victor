package com.carrent.application.mapper;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.domain.entity.Vehicle;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-05T12:01:41-0300",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.42.0.z20250331-1358, environment: Java 21.0.6 (Eclipse Adoptium)"
)
@Component
public class VehicleMapperImpl implements VehicleMapper {

    @Override
    public Vehicle toEntity(VehicleDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Vehicle.VehicleBuilder vehicle = Vehicle.builder();

        vehicle.available( dto.getAvailable() );
        vehicle.brand( dto.getBrand() );
        vehicle.category( dto.getCategory() );
        vehicle.dailyRate( dto.getDailyRate() );
        vehicle.description( dto.getDescription() );
        vehicle.model( dto.getModel() );
        vehicle.plate( dto.getPlate() );
        vehicle.status( dto.getStatus() );
        vehicle.year( dto.getYear() );

        return vehicle.build();
    }

    @Override
    public VehicleDTO toDTO(Vehicle entity) {
        if ( entity == null ) {
            return null;
        }

        VehicleDTO.VehicleDTOBuilder vehicleDTO = VehicleDTO.builder();

        vehicleDTO.status( entity.getStatus() );
        vehicleDTO.available( entity.getAvailable() );
        vehicleDTO.brand( entity.getBrand() );
        vehicleDTO.category( entity.getCategory() );
        vehicleDTO.createdAt( entity.getCreatedAt() );
        vehicleDTO.dailyRate( entity.getDailyRate() );
        vehicleDTO.description( entity.getDescription() );
        vehicleDTO.id( entity.getId() );
        vehicleDTO.model( entity.getModel() );
        vehicleDTO.plate( entity.getPlate() );
        vehicleDTO.updatedAt( entity.getUpdatedAt() );
        vehicleDTO.year( entity.getYear() );

        return vehicleDTO.build();
    }

    @Override
    public List<VehicleDTO> toDTOList(List<Vehicle> entities) {
        if ( entities == null ) {
            return null;
        }

        List<VehicleDTO> list = new ArrayList<VehicleDTO>( entities.size() );
        for ( Vehicle vehicle : entities ) {
            list.add( toDTO( vehicle ) );
        }

        return list;
    }

    @Override
    public void updateEntity(Vehicle entity, VehicleDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getAvailable() != null ) {
            entity.setAvailable( dto.getAvailable() );
        }
        if ( dto.getBrand() != null ) {
            entity.setBrand( dto.getBrand() );
        }
        if ( dto.getCategory() != null ) {
            entity.setCategory( dto.getCategory() );
        }
        if ( dto.getCreatedAt() != null ) {
            entity.setCreatedAt( dto.getCreatedAt() );
        }
        if ( dto.getDailyRate() != null ) {
            entity.setDailyRate( dto.getDailyRate() );
        }
        if ( dto.getDescription() != null ) {
            entity.setDescription( dto.getDescription() );
        }
        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getModel() != null ) {
            entity.setModel( dto.getModel() );
        }
        if ( dto.getPlate() != null ) {
            entity.setPlate( dto.getPlate() );
        }
        if ( dto.getStatus() != null ) {
            entity.setStatus( dto.getStatus() );
        }
        if ( dto.getUpdatedAt() != null ) {
            entity.setUpdatedAt( dto.getUpdatedAt() );
        }
        if ( dto.getYear() != null ) {
            entity.setYear( dto.getYear() );
        }
    }
}
