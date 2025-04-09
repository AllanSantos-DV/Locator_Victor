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

        // Verificar se o cliente já possui algum aluguel em andamento
        if (rentalRepository.hasActiveRentals(customer.getId())) {
            throw new IllegalStateException(
                    "O cliente já possui um aluguel em andamento e não pode alugar outro veículo");
        }

        Rental rental = rentalMapper.toEntity(rentalDTO);
        rental.setVehicle(vehicle);
        rental.setCustomer(customer);
        rental.setStatus(RentalStatus.PENDING);
        rental.setTotalAmount(
                calculateTotalAmount(vehicle.getDailyRate(), rentalDTO.getStartDate(), rentalDTO.getEndDate()));

        // Atualizar o status do veículo para RESERVED quando o aluguel for criado com
        // status PENDING
        // Manter a disponibilidade como true para permitir iniciar a locação
        // posteriormente
        vehicleRepository.updateStatus(VehicleStatus.RESERVED, true, vehicle.getId());

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

        // Garantir que o status do veículo seja RESERVED e disponível
        vehicleRepository.updateStatus(VehicleStatus.RESERVED, true, vehicle.getId());

        Rental updatedRental = rentalRepository.save(rental);
        return rentalMapper.toDTO(updatedRental);
    }

    @Transactional
    public void startRental(Long id) {
        // Busca o aluguel com todas as entidades relacionadas
        Rental rental = rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));

        // Valida o status do aluguel
        if (rental.getStatus() != RentalStatus.PENDING) {
            throw new IllegalStateException("Apenas locações pendentes podem ser iniciadas");
        }

        // Verifica se o veículo foi carregado corretamente
        Vehicle vehicle = rental.getVehicle();
        if (vehicle == null) {
            throw new IllegalStateException("Veículo não encontrado para o aluguel " + id);
        }

        // Não é mais necessário verificar a disponibilidade, pois veículos RESERVED
        // permanecem disponíveis

        // Atualiza o status do aluguel e do veículo diretamente no banco de dados
        rentalRepository.updateStatus(RentalStatus.IN_PROGRESS, id);
        vehicleRepository.updateStatus(VehicleStatus.RENTED, false, vehicle.getId());

        // Atualiza métricas
        metricsService.incrementActiveRentals();
    }

    @Transactional
    public void completeRental(Long id) {
        // Busca o aluguel com todas as entidades relacionadas
        Rental rental = rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));

        // Valida o status do aluguel
        if (rental.getStatus() != RentalStatus.IN_PROGRESS) {
            throw new IllegalStateException("Apenas locações em andamento podem ser finalizadas");
        }

        // Verifica se o veículo foi carregado corretamente
        Vehicle vehicle = rental.getVehicle();
        if (vehicle == null) {
            throw new IllegalStateException("Veículo não encontrado para o aluguel " + id);
        }

        // Atualiza o status do aluguel e do veículo diretamente no banco de dados
        rentalRepository.updateStatusAndReturnDate(RentalStatus.COMPLETED, LocalDateTime.now(), id);
        vehicleRepository.updateStatus(VehicleStatus.AVAILABLE, true, vehicle.getId());

        // Atualiza métricas
        metricsService.decrementActiveRentals();
    }

    @Transactional
    public void terminateRentalEarly(Long id) {
        // Busca o aluguel com todas as entidades relacionadas
        Rental rental = rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));

        // Valida o status do aluguel
        if (rental.getStatus() != RentalStatus.IN_PROGRESS) {
            throw new IllegalStateException("Apenas locações em andamento podem ser encerradas antecipadamente");
        }

        // Verifica se o veículo foi carregado corretamente
        Vehicle vehicle = rental.getVehicle();
        if (vehicle == null) {
            throw new IllegalStateException("Veículo não encontrado para o aluguel " + id);
        }

        // Cálculo dos valores
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate = rental.getStartDate();
        LocalDateTime endDate = rental.getEndDate();
        BigDecimal dailyRate = vehicle.getDailyRate();

        // Calcular dias utilizados (do início até agora)
        long daysUsed = ChronoUnit.DAYS.between(startDate, now) + 1; // +1 porque consideramos o dia atual
        if (daysUsed <= 0)
            daysUsed = 1; // Garantir pelo menos 1 dia

        // Calcular o valor pelos dias utilizados
        BigDecimal usedAmount = dailyRate.multiply(BigDecimal.valueOf(daysUsed));

        // Calcular a multa (10% do valor utilizado)
        BigDecimal terminationFee = usedAmount.multiply(BigDecimal.valueOf(0.1))
                .setScale(2, RoundingMode.HALF_UP);

        // Calcular o valor total (valor utilizado + multa)
        BigDecimal newTotalAmount = usedAmount.add(terminationFee)
                .setScale(2, RoundingMode.HALF_UP);

        // Atualizar o aluguel
        rentalRepository.updateForEarlyTermination(
                RentalStatus.EARLY_TERMINATED,
                now,
                terminationFee,
                newTotalAmount,
                id);

        // Liberar o veículo
        vehicleRepository.updateStatus(VehicleStatus.AVAILABLE, true, vehicle.getId());

        // Atualiza métricas
        metricsService.decrementActiveRentals();
    }

    @Transactional
    public void cancelRental(Long id) {
        // Busca o aluguel com todas as entidades relacionadas
        Rental rental = rentalRepository.findByIdWithVehicleAndCustomer(id)
                .orElseThrow(() -> new RentalNotFoundException(id));

        // Valida o status do aluguel - MODIFICADO
        if (rental.getStatus() == RentalStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                    "Aluguéis em andamento não podem ser cancelados. Use a função de encerramento antecipado.");
        } else if (rental.getStatus() != RentalStatus.PENDING) {
            throw new IllegalStateException("Apenas locações pendentes podem ser canceladas");
        }

        // Verificar se o veículo foi carregado corretamente
        Vehicle vehicle = rental.getVehicle();
        if (vehicle == null) {
            throw new IllegalStateException("Veículo não encontrado para o aluguel " + id);
        }

        // Atualiza status diretamente no banco de dados
        rentalRepository.updateStatus(RentalStatus.CANCELLED, id);
        vehicleRepository.updateStatus(VehicleStatus.AVAILABLE, true, vehicle.getId());
    }

    @Transactional
    public void delete(Long id) {
        Rental rental = findRentalById(id);

        if (!rental.getStatus().equals(RentalStatus.PENDING)) {
            throw new IllegalStateException("Apenas locações pendentes podem ser excluídas");
        }

        // Obter uma referência completa ao veículo (não um proxy)
        Vehicle vehicle = vehicleRepository.findById(rental.getVehicle().getId())
                .orElseThrow(() -> new IllegalStateException("Veículo não encontrado para o aluguel " + id));

        // Atualizar status do veículo usando o método do repositório
        vehicleRepository.updateStatus(VehicleStatus.AVAILABLE, true, vehicle.getId());

        // Depois excluir o aluguel
        rentalRepository.deleteById(id);
    }

    @Transactional
    public RentalDTO extendRental(Long id, LocalDateTime newEndDate) {
        Rental rental = findRentalById(id);

        // Validar se o aluguel está em andamento
        if (rental.getStatus() != RentalStatus.IN_PROGRESS) {
            throw new IllegalStateException("Apenas aluguéis em andamento podem ser estendidos");
        }

        // Validar se a nova data está no futuro
        LocalDateTime now = LocalDateTime.now();
        if (newEndDate.isBefore(now)) {
            throw new IllegalArgumentException("A nova data de término deve ser no futuro");
        }

        // Validar se a nova data é posterior à data de fim atual
        if (newEndDate.isBefore(rental.getEndDate())) {
            throw new IllegalArgumentException("A nova data de término deve ser posterior à data atual de fim");
        }

        // Verificar se não há conflitos com outros aluguéis para o mesmo veículo
        Vehicle vehicle = rental.getVehicle();
        if (vehicle == null) {
            throw new IllegalStateException("Veículo não encontrado para o aluguel " + id);
        }

        // Verificar disponibilidade do veículo no novo período
        List<RentalStatus> activeStatuses = List.of(RentalStatus.PENDING, RentalStatus.IN_PROGRESS);
        List<Rental> overlappingRentals = rentalRepository.findOverlappingRentals(
                vehicle.getId(),
                rental.getEndDate(),
                newEndDate,
                id, // excluir o próprio aluguel atual
                activeStatuses);

        if (!overlappingRentals.isEmpty()) {
            throw new VehicleNotAvailableException(
                    "Não é possível estender o aluguel pois o veículo já está reservado para o período solicitado");
        }

        // Calcular novo valor total
        BigDecimal dailyRate = vehicle.getDailyRate();
        BigDecimal newTotalAmount = calculateTotalAmount(dailyRate, rental.getStartDate(), newEndDate);

        // Atualizar a data de término e o valor total
        rentalRepository.updateRentalEndDate(newEndDate, newTotalAmount, id);

        // Recarregar o aluguel com os novos valores
        Rental updatedRental = findRentalById(id);
        return rentalMapper.toDTO(updatedRental);
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

        // Verificar se a data de início é hoje e se a hora é pelo menos 2 horas após a
        // hora atual
        LocalDateTime minStartTime = now.plusHours(2);
        if (startDate.toLocalDate().equals(now.toLocalDate()) && startDate.isBefore(minStartTime)) {
            throw new IllegalArgumentException(
                    "Para aluguéis que iniciam hoje, o horário de início deve ser pelo menos 2 horas após o horário atual");
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
        // Calcular dias (mesmo cálculo usado no frontend)
        // A diferença em dias é arredondada para cima para considerar dias parciais
        // como completos
        long diffInMillis = Math.abs(endDate.toInstant(java.time.ZoneOffset.UTC).toEpochMilli() -
                startDate.toInstant(java.time.ZoneOffset.UTC).toEpochMilli());
        long days = (long) Math.ceil(diffInMillis / (1000.0 * 60 * 60 * 24));

        // Para garantir que sempre seja cobrado pelo menos 1 dia
        days = Math.max(1, days);

        return dailyRate.multiply(BigDecimal.valueOf(days)).setScale(2, RoundingMode.HALF_UP);
    }

}
