package com.carrent.application.mapper;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.domain.entity.Vehicle;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-08T21:01:08-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.9 (Oracle Corporation)"
)
@Component
public class VehicleMapperImpl implements VehicleMapper {

    @Override
    public Vehicle toEntity(VehicleDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Vehicle.VehicleBuilder vehicle = Vehicle.builder();

        vehicle.brand( dto.getBrand() );
        vehicle.model( dto.getModel() );
        vehicle.year( dto.getYear() );
        vehicle.plate( dto.getPlate() );
        vehicle.dailyRate( dto.getDailyRate() );
        vehicle.available( dto.getAvailable() );
        vehicle.status( dto.getStatus() );
        vehicle.category( dto.getCategory() );
        vehicle.description( dto.getDescription() );

        return vehicle.build();
    }

    @Override
    public VehicleDTO toDTO(Vehicle entity) {
        if ( entity == null ) {
            return null;
        }

        VehicleDTO.VehicleDTOBuilder vehicleDTO = VehicleDTO.builder();

        vehicleDTO.status( entity.getStatus() );
        vehicleDTO.id( entity.getId() );
        vehicleDTO.brand( entity.getBrand() );
        vehicleDTO.model( entity.getModel() );
        vehicleDTO.year( entity.getYear() );
        vehicleDTO.plate( entity.getPlate() );
        vehicleDTO.dailyRate( entity.getDailyRate() );
        vehicleDTO.available( entity.getAvailable() );
        vehicleDTO.category( entity.getCategory() );
        vehicleDTO.description( entity.getDescription() );
        vehicleDTO.createdAt( entity.getCreatedAt() );
        vehicleDTO.updatedAt( entity.getUpdatedAt() );

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

        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getBrand() != null ) {
            entity.setBrand( dto.getBrand() );
        }
        if ( dto.getModel() != null ) {
            entity.setModel( dto.getModel() );
        }
        if ( dto.getYear() != null ) {
            entity.setYear( dto.getYear() );
        }
        if ( dto.getPlate() != null ) {
            entity.setPlate( dto.getPlate() );
        }
        if ( dto.getDailyRate() != null ) {
            entity.setDailyRate( dto.getDailyRate() );
        }
        if ( dto.getAvailable() != null ) {
            entity.setAvailable( dto.getAvailable() );
        }
        if ( dto.getStatus() != null ) {
            entity.setStatus( dto.getStatus() );
        }
        if ( dto.getCategory() != null ) {
            entity.setCategory( dto.getCategory() );
        }
        if ( dto.getDescription() != null ) {
            entity.setDescription( dto.getDescription() );
        }
        if ( dto.getCreatedAt() != null ) {
            entity.setCreatedAt( dto.getCreatedAt() );
        }
        if ( dto.getUpdatedAt() != null ) {
            entity.setUpdatedAt( dto.getUpdatedAt() );
        }
    }
}
