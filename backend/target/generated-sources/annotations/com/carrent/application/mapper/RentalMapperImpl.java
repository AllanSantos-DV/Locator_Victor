package com.carrent.application.mapper;

import com.carrent.application.dto.RentalDTO;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.entity.Rental;
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
public class RentalMapperImpl implements RentalMapper {

    @Override
    public Rental toEntity(RentalDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Rental.RentalBuilder rental = Rental.builder();

        rental.actualReturnDate( dto.getActualReturnDate() );
        rental.endDate( dto.getEndDate() );
        rental.notes( dto.getNotes() );
        rental.startDate( dto.getStartDate() );
        rental.status( dto.getStatus() );
        rental.totalAmount( dto.getTotalAmount() );

        return rental.build();
    }

    @Override
    public RentalDTO toDTO(Rental entity) {
        if ( entity == null ) {
            return null;
        }

        RentalDTO.RentalDTOBuilder rentalDTO = RentalDTO.builder();

        rentalDTO.vehiclePlate( entityVehiclePlate( entity ) );
        rentalDTO.vehicleId( entityVehicleId( entity ) );
        rentalDTO.vehicleBrand( entityVehicleBrand( entity ) );
        rentalDTO.vehicleModel( entityVehicleModel( entity ) );
        rentalDTO.customerName( entityCustomerName( entity ) );
        rentalDTO.customerId( entityCustomerId( entity ) );
        rentalDTO.createdAt( entity.getCreatedAt() );
        rentalDTO.updatedAt( entity.getUpdatedAt() );
        rentalDTO.actualReturnDate( entity.getActualReturnDate() );
        rentalDTO.endDate( entity.getEndDate() );
        rentalDTO.id( entity.getId() );
        rentalDTO.notes( entity.getNotes() );
        rentalDTO.startDate( entity.getStartDate() );
        rentalDTO.status( entity.getStatus() );
        rentalDTO.totalAmount( entity.getTotalAmount() );

        return rentalDTO.build();
    }

    @Override
    public List<RentalDTO> toDTOList(List<Rental> entities) {
        if ( entities == null ) {
            return null;
        }

        List<RentalDTO> list = new ArrayList<RentalDTO>( entities.size() );
        for ( Rental rental : entities ) {
            list.add( toDTO( rental ) );
        }

        return list;
    }

    @Override
    public void updateEntity(Rental entity, RentalDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getActualReturnDate() != null ) {
            entity.setActualReturnDate( dto.getActualReturnDate() );
        }
        if ( dto.getEndDate() != null ) {
            entity.setEndDate( dto.getEndDate() );
        }
        if ( dto.getNotes() != null ) {
            entity.setNotes( dto.getNotes() );
        }
        if ( dto.getStartDate() != null ) {
            entity.setStartDate( dto.getStartDate() );
        }
        if ( dto.getStatus() != null ) {
            entity.setStatus( dto.getStatus() );
        }
        if ( dto.getTotalAmount() != null ) {
            entity.setTotalAmount( dto.getTotalAmount() );
        }
    }

    private String entityVehiclePlate(Rental rental) {
        if ( rental == null ) {
            return null;
        }
        Vehicle vehicle = rental.getVehicle();
        if ( vehicle == null ) {
            return null;
        }
        String plate = vehicle.getPlate();
        if ( plate == null ) {
            return null;
        }
        return plate;
    }

    private Long entityVehicleId(Rental rental) {
        if ( rental == null ) {
            return null;
        }
        Vehicle vehicle = rental.getVehicle();
        if ( vehicle == null ) {
            return null;
        }
        Long id = vehicle.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    private String entityVehicleBrand(Rental rental) {
        if ( rental == null ) {
            return null;
        }
        Vehicle vehicle = rental.getVehicle();
        if ( vehicle == null ) {
            return null;
        }
        String brand = vehicle.getBrand();
        if ( brand == null ) {
            return null;
        }
        return brand;
    }

    private String entityVehicleModel(Rental rental) {
        if ( rental == null ) {
            return null;
        }
        Vehicle vehicle = rental.getVehicle();
        if ( vehicle == null ) {
            return null;
        }
        String model = vehicle.getModel();
        if ( model == null ) {
            return null;
        }
        return model;
    }

    private String entityCustomerName(Rental rental) {
        if ( rental == null ) {
            return null;
        }
        Customer customer = rental.getCustomer();
        if ( customer == null ) {
            return null;
        }
        String name = customer.getName();
        if ( name == null ) {
            return null;
        }
        return name;
    }

    private Long entityCustomerId(Rental rental) {
        if ( rental == null ) {
            return null;
        }
        Customer customer = rental.getCustomer();
        if ( customer == null ) {
            return null;
        }
        Long id = customer.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
