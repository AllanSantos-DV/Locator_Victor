package com.carrent.application.mapper;

import com.carrent.application.dto.CustomerDTO;
import com.carrent.domain.entity.Customer;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2025-04-08T21:01:07-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 17.0.9 (Oracle Corporation)"
)
@Component
public class CustomerMapperImpl implements CustomerMapper {

    @Override
    public Customer toEntity(CustomerDTO dto) {
        if ( dto == null ) {
            return null;
        }

        Customer.CustomerBuilder customer = Customer.builder();

        customer.name( dto.getName() );
        customer.email( dto.getEmail() );
        customer.phone( dto.getPhone() );
        customer.document( dto.getDocument() );
        customer.address( dto.getAddress() );

        return customer.build();
    }

    @Override
    public CustomerDTO toDTO(Customer entity) {
        if ( entity == null ) {
            return null;
        }

        CustomerDTO.CustomerDTOBuilder customerDTO = CustomerDTO.builder();

        customerDTO.id( entity.getId() );
        customerDTO.name( entity.getName() );
        customerDTO.email( entity.getEmail() );
        customerDTO.phone( entity.getPhone() );
        customerDTO.document( entity.getDocument() );
        customerDTO.address( entity.getAddress() );
        customerDTO.createdAt( entity.getCreatedAt() );
        customerDTO.updatedAt( entity.getUpdatedAt() );

        return customerDTO.build();
    }

    @Override
    public List<CustomerDTO> toDTOList(List<Customer> entities) {
        if ( entities == null ) {
            return null;
        }

        List<CustomerDTO> list = new ArrayList<CustomerDTO>( entities.size() );
        for ( Customer customer : entities ) {
            list.add( toDTO( customer ) );
        }

        return list;
    }

    @Override
    public void updateEntity(Customer entity, CustomerDTO dto) {
        if ( dto == null ) {
            return;
        }

        if ( dto.getId() != null ) {
            entity.setId( dto.getId() );
        }
        if ( dto.getName() != null ) {
            entity.setName( dto.getName() );
        }
        if ( dto.getEmail() != null ) {
            entity.setEmail( dto.getEmail() );
        }
        if ( dto.getPhone() != null ) {
            entity.setPhone( dto.getPhone() );
        }
        if ( dto.getDocument() != null ) {
            entity.setDocument( dto.getDocument() );
        }
        if ( dto.getAddress() != null ) {
            entity.setAddress( dto.getAddress() );
        }
        if ( dto.getCreatedAt() != null ) {
            entity.setCreatedAt( dto.getCreatedAt() );
        }
        if ( dto.getUpdatedAt() != null ) {
            entity.setUpdatedAt( dto.getUpdatedAt() );
        }
    }
}
