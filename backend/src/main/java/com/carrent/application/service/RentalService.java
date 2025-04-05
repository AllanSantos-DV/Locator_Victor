package com.carrent.application.service;

import com.carrent.application.dto.RentalDTO;
import com.carrent.application.mapper.RentalMapper;
import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.entity.VehicleStatus;
import com.carrent.domain.exception.RentalNotFoundException;
import com.carrent.domain.exception.VehicleNotAvailableException;
import com.carrent.domain.exception.CustomerNotFoundException;
import com.carrent.domain.exception.VehicleNotFoundException;
import com.carrent.domain.repository.RentalRepository;
import com.carrent.domain.repository.VehicleRepository;
import com.carrent.domain.repository.CustomerRepository;
import com.carrent.infrastructure.metrics.CustomMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final RentalMapper rentalMapper;
    private final CustomMetricsService metricsService;

    private static final int MAX_RENTAL_DAYS = 30;
    private static final int MIN_RENTAL_DAYS = 1;

    @Transactional(readOnly = true)
    public List<RentalDTO> findAll() {
        List<Rental> rentals = rentalRepository.findAllWithCustomersAndVehicles();
        return rentalMapper.toDTOList(rentals);
    }

    @Transactional(readOnly = true)
    public RentalDTO findById(Long id) {
        Rental rental = rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));
        return rentalMapper.toDTO(rental);
    }

    @Transactional(readOnly = true)
    public List<RentalDTO> findByCustomerId(Long customerId) {
        List<Rental> rentals = rentalRepository.findByCustomerId(customerId);
        return rentalMapper.toDTOList(rentals);
    }

    @Transactional(readOnly = true)
    public List<RentalDTO> findByVehicleId(Long vehicleId) {
        List<Rental> rentals = rentalRepository.findByVehicleId(vehicleId);
        return rentalMapper.toDTOList(rentals);
    }

    @Transactional(readOnly = true)
    public List<RentalDTO> findByStatus(RentalStatus status) {
        List<Rental> rentals = rentalRepository.findByStatus(status);
        return rentalMapper.toDTOList(rentals);
    }

    @Transactional(readOnly = true)
    public List<RentalDTO> findByPeriod(LocalDateTime start, LocalDateTime end) {
        if (start.isAfter(end)) {
            throw new IllegalArgumentException("A data de início deve ser anterior à data de término");
        }
        List<Rental> rentals = rentalRepository.findByStartDateBetweenOrEndDateBetween(start, end);
        return rentalMapper.toDTOList(rentals);
    }

    @Transactional
    public RentalDTO create(RentalDTO rentalDTO) {
        validateRentalDates(rentalDTO.getStartDate(), rentalDTO.getEndDate());
        validateVehicleAvailability(rentalDTO.getVehiclePlate(), rentalDTO.getStartDate(), rentalDTO.getEndDate());

        Vehicle vehicle = findVehicleByPlate(rentalDTO.getVehiclePlate());
        Customer customer = findCustomerById(rentalDTO.getCustomerId());

        Rental rental = rentalMapper.toEntity(rentalDTO);
        rental.setVehicle(vehicle);
        rental.setCustomer(customer);
        rental.setStatus(RentalStatus.PENDING);
        rental.setTotalAmount(
                calculateTotalAmount(vehicle.getDailyRate(), rentalDTO.getStartDate(), rentalDTO.getEndDate()));

        Rental savedRental = rentalRepository.save(rental);
        return rentalMapper.toDTO(savedRental);
    }

    @Transactional
    public RentalDTO update(Long id, RentalDTO rentalDTO) {
        Rental rental = findRentalById(id);

        if (!rental.getStatus().equals(RentalStatus.PENDING)) {
            throw new IllegalStateException("Não é possível atualizar uma locação que não está pendente");
        }

        validateRentalDates(rentalDTO.getStartDate(), rentalDTO.getEndDate());
        validateVehicleAvailability(rentalDTO.getVehiclePlate(), rentalDTO.getStartDate(), rentalDTO.getEndDate(), id);

        Vehicle vehicle = findVehicleByPlate(rentalDTO.getVehiclePlate());
        Customer customer = findCustomerById(rentalDTO.getCustomerId());

        rentalMapper.updateEntity(rental, rentalDTO);
        rental.setVehicle(vehicle);
        rental.setCustomer(customer);
        rental.setTotalAmount(
                calculateTotalAmount(vehicle.getDailyRate(), rentalDTO.getStartDate(), rentalDTO.getEndDate()));

        Rental updatedRental = rentalRepository.save(rental);
        return rentalMapper.toDTO(updatedRental);
    }

    @Transactional
    public RentalDTO startRental(Long id) {
        // Busca o aluguel com todas as entidades relacionadas
        Rental rental = rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));

        // Valida o status do aluguel
        if (rental.getStatus() != RentalStatus.PENDING) {
            throw new IllegalStateException("Apenas locações pendentes podem ser iniciadas");
        }

        // Valida a disponibilidade do veículo
        Vehicle vehicle = rental.getVehicle();
        if (!vehicle.getAvailable()) {
            throw new VehicleNotAvailableException("O veículo não está disponível");
        }

        // Atualiza o status do aluguel e do veículo em uma única transação
        rental.setStatus(RentalStatus.IN_PROGRESS);
        vehicle.setAvailable(false);
        vehicle.setStatus(VehicleStatus.RENTED);

        // Salva o aluguel (o veículo será salvo automaticamente devido ao cascade)
        rental = rentalRepository.save(rental);

        // Atualiza métricas
        metricsService.incrementActiveRentals();

        return rentalMapper.toDTO(rental);
    }

    @Transactional
    public RentalDTO completeRental(Long id) {
        // Busca o aluguel com todas as entidades relacionadas
        Rental rental = rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));

        // Valida o status do aluguel
        if (rental.getStatus() != RentalStatus.IN_PROGRESS) {
            throw new IllegalStateException("Apenas locações em andamento podem ser finalizadas");
        }

        // Atualiza o status do aluguel e do veículo em uma única transação
        rental.setStatus(RentalStatus.COMPLETED);
        rental.setActualReturnDate(LocalDateTime.now());

        Vehicle vehicle = rental.getVehicle();
        vehicle.setAvailable(true);
        vehicle.setStatus(VehicleStatus.AVAILABLE);

        // Salva o aluguel (o veículo será salvo automaticamente devido ao cascade)
        rental = rentalRepository.save(rental);

        // Atualiza métricas
        metricsService.decrementActiveRentals();

        return rentalMapper.toDTO(rental);
    }


    @Transactional
    public RentalDTO cancelRental(Long id) {
        // Busca o aluguel com todas as entidades relacionadas
        Rental rental = rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));

        // Valida o status do aluguel
        if (rental.getStatus() != RentalStatus.PENDING && rental.getStatus() != RentalStatus.IN_PROGRESS) {
            throw new IllegalStateException("Apenas locações pendentes ou em andamento podem ser canceladas");
        }

        // Atualiza o status do aluguel e do veículo em uma única transação
        rental.setStatus(RentalStatus.CANCELLED);

        Vehicle vehicle = rental.getVehicle();
        vehicle.setAvailable(true);
        vehicle.setStatus(VehicleStatus.AVAILABLE);

        // Salva o aluguel (o veículo será salvo automaticamente devido ao cascade)
        rental = rentalRepository.save(rental);

        // Atualiza métricas se necessário
        if (rental.getStatus() == RentalStatus.IN_PROGRESS) {
            metricsService.decrementActiveRentals();
        }

        return rentalMapper.toDTO(rental);
    }

    @Transactional
    public void delete(Long id) {
        Rental rental = findRentalById(id);

        if (!rental.getStatus().equals(RentalStatus.PENDING)) {
            throw new IllegalStateException("Apenas locações pendentes podem ser excluídas");
        }

        // Atualizar o veículo
        Vehicle vehicle = rental.getVehicle();
        vehicle.setAvailable(true);
        vehicle.setStatus(VehicleStatus.AVAILABLE);

        // Salvar as alterações do veículo primeiro
        vehicleRepository.save(vehicle);

        // Depois excluir o aluguel
        rentalRepository.deleteById(id);
    }

    private Rental findRentalById(Long id) {
        return rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));
    }

    private Vehicle findVehicleByPlate(String plate) {
        return vehicleRepository.findVehicleByPlate(plate)
                .orElseThrow(() -> new VehicleNotFoundException(plate));
    }

    private Customer findCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new CustomerNotFoundException(id));
    }

    private void validateRentalDates(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();

        if (startDate.isBefore(now)) {
            throw new IllegalArgumentException("A data de início não pode ser no passado");
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("A data de término deve ser posterior à data de início");
        }

        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days < MIN_RENTAL_DAYS) {
            throw new IllegalArgumentException("A locação deve ter no mínimo " + MIN_RENTAL_DAYS + " dia");
        }

        if (days > MAX_RENTAL_DAYS) {
            throw new IllegalArgumentException("A locação não pode exceder " + MAX_RENTAL_DAYS + " dias");
        }
    }

    private void validateVehicleAvailability(String vehiclePlate, LocalDateTime startDate, LocalDateTime endDate) {
        validateVehicleAvailability(vehiclePlate, startDate, endDate, null);
    }

    private void validateVehicleAvailability(String vehiclePlate, LocalDateTime startDate, LocalDateTime endDate,
            Long excludeRentalId) {
        Vehicle vehicle = findVehicleByPlate(vehiclePlate);

        if (!vehicle.getAvailable()) {
            throw new VehicleNotAvailableException("O veículo não está disponível para locação");
        }

        List<RentalStatus> activeStatuses = List.of(RentalStatus.PENDING, RentalStatus.IN_PROGRESS);
        List<Rental> overlappingRentals = rentalRepository.findOverlappingRentals(vehicle.getId(), startDate, endDate,
                excludeRentalId, activeStatuses);
        if (!overlappingRentals.isEmpty()) {
            throw new VehicleNotAvailableException("O veículo não está disponível para o período solicitado");
        }
    }

    private BigDecimal calculateTotalAmount(BigDecimal dailyRate, LocalDateTime startDate, LocalDateTime endDate) {
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        return dailyRate.multiply(BigDecimal.valueOf(days)).setScale(2, RoundingMode.HALF_UP);
    }

}
