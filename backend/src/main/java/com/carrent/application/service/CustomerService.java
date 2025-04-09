package com.carrent.application.service;

import com.carrent.application.dto.CustomerDTO;
import com.carrent.application.mapper.CustomerMapper;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import com.carrent.domain.exception.CustomerNotFoundException;
import com.carrent.domain.exception.DuplicateResourceException;
import com.carrent.domain.repository.CustomerRepository;
import com.carrent.domain.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final RentalRepository rentalRepository;

    @Transactional(readOnly = true)
    public List<CustomerDTO> findAll() {
        return customerMapper.toDTOList(customerRepository.findAll());
    }

    @Transactional(readOnly = true)
    public CustomerDTO findById(Long id) {
        return customerMapper.toDTO(findCustomerById(id));
    }

    @Transactional(readOnly = true)
    public CustomerDTO findByEmail(String email) {
        return customerRepository.findByEmail(email)
                .map(customerMapper::toDTO)
                .orElseThrow(() -> new CustomerNotFoundException(email, "email"));
    }

    @Transactional(readOnly = true)
    public CustomerDTO findByDocument(String document) {
        return customerRepository.findByDocument(document)
                .map(customerMapper::toDTO)
                .orElseThrow(() -> new CustomerNotFoundException(document, "documento"));
    }

    @Transactional
    public CustomerDTO create(CustomerDTO customerDTO) {
        validateEmailUniqueness(customerDTO.getEmail());
        validateDocumentUniqueness(customerDTO.getDocument());

        Customer customer = customerMapper.toEntity(customerDTO);
        return customerMapper.toDTO(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDTO update(Long id, CustomerDTO customerDTO) {
        Customer customer = findCustomerById(id);

        if (!customer.getEmail().equals(customerDTO.getEmail())) {
            validateEmailUniqueness(customerDTO.getEmail());
        }

        if (!customer.getDocument().equals(customerDTO.getDocument())) {
            validateDocumentUniqueness(customerDTO.getDocument());
        }

        customerMapper.updateEntity(customer, customerDTO);
        return customerMapper.toDTO(customerRepository.save(customer));
    }

    @Transactional
    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new CustomerNotFoundException(id);
        }

        // Verificar se o cliente possui aluguéis pendentes ou em andamento
        boolean hasActiveRentals = rentalRepository.hasActiveRentals(id);
        if (hasActiveRentals) {
            throw new IllegalStateException("Não é possível excluir cliente com aluguéis pendentes ou em andamento");
        }

        // Verificar se o cliente possui aluguéis pendentes
        List<Rental> pendingRentals = rentalRepository.findByCustomerIdAndStatus(id, RentalStatus.PENDING);
        if (!pendingRentals.isEmpty()) {
            throw new IllegalStateException("Não é possível excluir cliente com aluguéis pendentes");
        }

        customerRepository.deleteById(id);
    }

    private Customer findCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }

    private void validateEmailUniqueness(String email) {
        if (customerRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Já existe um cliente cadastrado com este email");
        }
    }

    private void validateDocumentUniqueness(String document) {
        if (customerRepository.existsByDocument(document)) {
            throw new DuplicateResourceException("Já existe um cliente cadastrado com este documento");
        }
    }
}