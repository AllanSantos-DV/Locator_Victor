package com.carrent.application.service.admin;

import com.carrent.application.dto.metrics.BusinessMetricsDTO;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.entity.VehicleStatus;
import com.carrent.domain.repository.CustomerRepository;
import com.carrent.domain.repository.RentalRepository;
import com.carrent.domain.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BusinessMetricsService {

        private final RentalRepository rentalRepository;
        private final VehicleRepository vehicleRepository;
        private final CustomerRepository customerRepository;

        @Transactional(readOnly = true)
        public BusinessMetricsDTO getBusinessMetrics() {
                // Período padrão: últimos 30 dias
                LocalDateTime periodEnd = LocalDateTime.now();
                LocalDateTime periodStart = periodEnd.minusDays(30);
                return getBusinessMetrics(null, null, null, null, null);
        }

        @Transactional(readOnly = true)
        public BusinessMetricsDTO getBusinessMetrics(String days, String startDate, String endDate, String category,
                        String status) {
                // Definir o período com base nos parâmetros
                LocalDateTime periodStart = null;
                LocalDateTime periodEnd = LocalDateTime.now();

                if (days != null && !days.isEmpty()) {
                        try {
                                int daysInt = Integer.parseInt(days);
                                periodStart = periodEnd.minusDays(daysInt);
                        } catch (NumberFormatException e) {
                                // Se não for um número válido, usar período padrão de 30 dias
                                periodStart = periodEnd.minusDays(30);
                        }
                } else if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
                        try {
                                periodStart = LocalDate.parse(startDate).atStartOfDay();
                                periodEnd = LocalDate.parse(endDate).atTime(23, 59, 59);
                        } catch (Exception e) {
                                // Se as datas não forem válidas, usar período padrão de 30 dias
                                periodStart = periodEnd.minusDays(30);
                        }
                } else {
                        // Período padrão: últimos 30 dias
                        periodStart = periodEnd.minusDays(30);
                }

                return BusinessMetricsDTO.builder()
                                .rentalMetrics(calculateRentalMetrics(periodStart, periodEnd, category, status))
                                .vehicleMetrics(calculateVehicleMetrics(periodStart, periodEnd, category, status))
                                .discountMetrics(calculateDiscountMetrics(periodStart, periodEnd, category, status))
                                .build();
        }

        @Transactional(readOnly = true)
        private BusinessMetricsDTO.RentalMetrics calculateRentalMetrics(LocalDateTime periodStart,
                        LocalDateTime periodEnd, String category, String status) {
                List<Rental> allRentals = rentalRepository.findAllWithCustomersAndVehicles();

                // Filtrar rentals pelo período
                List<Rental> filteredRentals = allRentals.stream()
                                .filter(rental -> {
                                        // Aplicar filtro de período - verificar se há interseção
                                        boolean inPeriod = rental.getStartDate() != null &&
                                                        rental.getEndDate() != null &&
                                                        !(rental.getEndDate().isBefore(periodStart) ||
                                                                        rental.getStartDate().isAfter(periodEnd));

                                        // Aplicar filtro de categoria, se fornecido
                                        boolean matchesCategory = category == null || category.isEmpty() ||
                                                        (rental.getVehicle() != null &&
                                                                        rental.getVehicle().getCategory() != null &&
                                                                        rental.getVehicle().getCategory().name()
                                                                                        .equals(category));

                                        // Aplicar filtro de status, se fornecido
                                        boolean matchesStatus = status == null || status.isEmpty() ||
                                                        (rental.getStatus() != null &&
                                                                        rental.getStatus().name().equals(status));

                                        return inPeriod && matchesCategory && matchesStatus;
                                })
                                .collect(Collectors.toList());

                long totalRentals = filteredRentals.size();
                long activeRentals = filteredRentals.stream()
                                .filter(r -> r.getStatus() == RentalStatus.IN_PROGRESS)
                                .count();
                long completedRentals = filteredRentals.stream()
                                .filter(r -> r.getStatus() == RentalStatus.COMPLETED)
                                .count();
                long cancelledRentals = filteredRentals.stream()
                                .filter(r -> r.getStatus() == RentalStatus.CANCELLED)
                                .count();

                // Cálculo da duração média em dias
                double averageDuration = filteredRentals.stream()
                                .filter(r -> r.getEndDate() != null && r.getStartDate() != null)
                                .mapToDouble(r -> {
                                        LocalDateTime end = r.getActualReturnDate() != null ? r.getActualReturnDate()
                                                        : r.getEndDate();
                                        return Duration.between(r.getStartDate(), end).toDays();
                                })
                                .average()
                                .orElse(0.0);

                // Aluguéis por mês - garantir que incluímos todos os meses no período
                Map<String, Long> rentalsByMonth = new HashMap<>();

                // Inicializar todos os meses do período com zero aluguéis
                LocalDateTime current = periodStart;
                DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

                while (!current.isAfter(periodEnd)) {
                        String monthKey = current.format(monthFormatter);
                        rentalsByMonth.put(monthKey, 0L);
                        current = current.plusMonths(1).withDayOfMonth(1);
                }

                // Adicionar os aluguéis efetivamente realizados
                filteredRentals.forEach(rental -> {
                        if (rental.getStartDate() != null) {
                                String monthKey = rental.getStartDate().format(monthFormatter);
                                rentalsByMonth.put(monthKey, rentalsByMonth.getOrDefault(monthKey, 0L) + 1);
                        }
                });

                // Adicionar aluguéis por mês e status
                Map<String, Map<String, Long>> rentalsByMonthAndStatus = new HashMap<>();

                // Inicializar map para cada status
                for (RentalStatus rentalStatus : RentalStatus.values()) {
                        rentalsByMonthAndStatus.put(rentalStatus.name(), new HashMap<>());

                        // Inicializar todos os meses com zero
                        current = periodStart;
                        while (!current.isAfter(periodEnd)) {
                                String monthKey = current.format(monthFormatter);
                                rentalsByMonthAndStatus.get(rentalStatus.name()).put(monthKey, 0L);
                                current = current.plusMonths(1).withDayOfMonth(1);
                        }
                }

                // Preencher com dados reais
                filteredRentals.forEach(rental -> {
                        if (rental.getStartDate() != null && rental.getStatus() != null) {
                                String monthKey = rental.getStartDate().format(monthFormatter);
                                String statusKey = rental.getStatus().name();

                                Map<String, Long> statusMap = rentalsByMonthAndStatus.getOrDefault(statusKey,
                                                new HashMap<>());
                                statusMap.put(monthKey, statusMap.getOrDefault(monthKey, 0L) + 1);
                                rentalsByMonthAndStatus.put(statusKey, statusMap);
                        }
                });

                // Converter para lista de DTOs para dados detalhados
                List<BusinessMetricsDTO.RentalItemDTO> rentalDTOs = filteredRentals.stream()
                                .map(rental -> BusinessMetricsDTO.RentalItemDTO.builder()
                                                .id(rental.getId())
                                                .startDate(rental.getStartDate() != null
                                                                ? rental.getStartDate().toString()
                                                                : null)
                                                .endDate(rental.getEndDate() != null ? rental.getEndDate().toString()
                                                                : null)
                                                .status(rental.getStatus() != null ? rental.getStatus().name() : null)
                                                .customerId(rental.getCustomer() != null ? rental.getCustomer().getId()
                                                                : null)
                                                .customerName(rental.getCustomer() != null
                                                                ? rental.getCustomer().getName()
                                                                : null)
                                                .vehicleId(rental.getVehicle() != null ? rental.getVehicle().getId()
                                                                : null)
                                                .vehicleModel(rental.getVehicle() != null
                                                                ? rental.getVehicle().getBrand() + " "
                                                                                + rental.getVehicle().getModel()
                                                                : null)
                                                .totalAmount(rental.getTotalAmount())
                                                .build())
                                .collect(Collectors.toList());

                // Aluguéis por status
                Map<String, Long> rentalsByStatus = filteredRentals.stream()
                                .collect(Collectors.groupingBy(
                                                r -> r.getStatus() != null ? r.getStatus().name() : "UNKNOWN",
                                                Collectors.counting()));

                // Top 5 clientes com mais aluguéis
                Map<Customer, List<Rental>> rentalsByCustomer = filteredRentals.stream()
                                .filter(r -> r.getCustomer() != null)
                                .collect(Collectors.groupingBy(Rental::getCustomer));

                List<BusinessMetricsDTO.TopCustomerDTO> topCustomers = rentalsByCustomer.entrySet().stream()
                                .map(entry -> {
                                        Customer customer = entry.getKey();
                                        List<Rental> customerRentals = entry.getValue();
                                        BigDecimal totalSpent = customerRentals.stream()
                                                        .map(Rental::getTotalAmount)
                                                        .filter(amount -> amount != null)
                                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                        return BusinessMetricsDTO.TopCustomerDTO.builder()
                                                        .customerId(customer.getId())
                                                        .customerName(customer.getName())
                                                        .rentalCount(customerRentals.size())
                                                        .totalSpent(totalSpent)
                                                        .build();
                                })
                                .sorted(Comparator.comparing(BusinessMetricsDTO.TopCustomerDTO::getRentalCount)
                                                .reversed())
                                .limit(5)
                                .collect(Collectors.toList());

                return BusinessMetricsDTO.RentalMetrics.builder()
                                .totalRentals(totalRentals)
                                .activeRentals(activeRentals)
                                .completedRentals(completedRentals)
                                .cancelledRentals(cancelledRentals)
                                .averageDuration(averageDuration)
                                .rentalsByMonth(rentalsByMonth)
                                .rentalsByStatus(rentalsByStatus)
                                .topCustomers(topCustomers)
                                .rentals(rentalDTOs)
                                .rentalsByMonthAndStatus(rentalsByMonthAndStatus)
                                .build();
        }

        @Transactional(readOnly = true)
        private BusinessMetricsDTO.RentalMetrics calculateRentalMetrics() {
                // Período padrão: últimos 30 dias
                LocalDateTime periodEnd = LocalDateTime.now();
                LocalDateTime periodStart = periodEnd.minusDays(30);
                return calculateRentalMetrics(periodStart, periodEnd, null, null);
        }

        @Transactional(readOnly = true)
        private BusinessMetricsDTO.VehicleMetrics calculateVehicleMetrics(LocalDateTime periodStart,
                        LocalDateTime periodEnd, String category, String status) {
                List<Vehicle> allVehicles = vehicleRepository.findAll();
                List<Rental> allRentals = rentalRepository.findAllWithCustomersAndVehicles();

                // Filtrar veículos pela categoria, se fornecido
                List<Vehicle> filteredVehicles = allVehicles;
                if (category != null && !category.isEmpty()) {
                        filteredVehicles = allVehicles.stream()
                                        .filter(v -> v.getCategory() != null && v.getCategory().name().equals(category))
                                        .collect(Collectors.toList());
                }

                // Filtrar aluguéis pelo período e outros filtros
                List<Rental> filteredRentals = allRentals.stream()
                                .filter(rental -> {
                                        // Aplicar filtro de período - verificar se há interseção
                                        boolean inPeriod = rental.getStartDate() != null &&
                                                        rental.getEndDate() != null &&
                                                        !(rental.getEndDate().isBefore(periodStart) ||
                                                                        rental.getStartDate().isAfter(periodEnd));

                                        // Aplicar filtro de categoria, se fornecido
                                        boolean matchesCategory = category == null || category.isEmpty() ||
                                                        (rental.getVehicle() != null &&
                                                                        rental.getVehicle().getCategory() != null &&
                                                                        rental.getVehicle().getCategory().name()
                                                                                        .equals(category));

                                        // Aplicar filtro de status, se fornecido
                                        boolean matchesStatus = status == null || status.isEmpty() ||
                                                        (rental.getStatus() != null &&
                                                                        rental.getStatus().name().equals(status));

                                        return inPeriod && matchesCategory && matchesStatus;
                                })
                                .collect(Collectors.toList());

                long totalVehicles = filteredVehicles.size();
                long availableVehicles = filteredVehicles.stream()
                                .filter(v -> v.getAvailable() != null && v.getAvailable())
                                .count();
                long unavailableVehicles = totalVehicles - availableVehicles;

                // Veículos por categoria
                Map<String, Long> vehiclesByCategory = filteredVehicles.stream()
                                .collect(Collectors.groupingBy(
                                                v -> v.getCategory() != null ? v.getCategory().name() : "UNKNOWN",
                                                Collectors.counting()));

                // Veículos por status
                Map<String, Long> vehiclesByStatus = filteredVehicles.stream()
                                .collect(Collectors.groupingBy(
                                                v -> v.getStatus() != null ? v.getStatus().name() : "UNKNOWN",
                                                Collectors.counting()));

                // Top 5 veículos mais alugados no período filtrado
                Map<Vehicle, List<Rental>> rentalsByVehicle = filteredRentals.stream()
                                .filter(r -> r.getVehicle() != null)
                                .collect(Collectors.groupingBy(Rental::getVehicle));

                // Calcula a taxa de utilização para o período filtrado
                final long totalDaysInPeriod = Duration.between(periodStart, periodEnd).toDays();
                final long effectiveDaysInPeriod = totalDaysInPeriod <= 0 ? 1 : totalDaysInPeriod; // Evitar divisão por
                                                                                                   // zero

                List<BusinessMetricsDTO.TopVehicleDTO> mostRentedVehicles = rentalsByVehicle.entrySet().stream()
                                .map(entry -> {
                                        Vehicle vehicle = entry.getKey();
                                        List<Rental> vehicleRentals = entry.getValue();
                                        BigDecimal totalRevenue = vehicleRentals.stream()
                                                        .map(Rental::getTotalAmount)
                                                        .filter(amount -> amount != null)
                                                        .reduce(BigDecimal.ZERO, BigDecimal::add);

                                        // Cálculo da taxa de utilização para o período filtrado
                                        long daysRented = vehicleRentals.stream()
                                                        .filter(r -> r.getStartDate() != null &&
                                                                        (r.getActualReturnDate() != null
                                                                                        || r.getEndDate() != null))
                                                        .mapToLong(r -> {
                                                                LocalDateTime start = r.getStartDate()
                                                                                .isBefore(periodStart)
                                                                                                ? periodStart
                                                                                                : r.getStartDate();
                                                                LocalDateTime end = r.getActualReturnDate() != null
                                                                                ? r.getActualReturnDate()
                                                                                : r.getEndDate();
                                                                if (end.isAfter(periodEnd))
                                                                        end = periodEnd;
                                                                return Math.max(0,
                                                                                Duration.between(start, end).toDays());
                                                        })
                                                        .sum();

                                        double utilizationRate = (double) daysRented / effectiveDaysInPeriod * 100;

                                        return BusinessMetricsDTO.TopVehicleDTO.builder()
                                                        .vehicleId(vehicle.getId())
                                                        .vehicleBrand(vehicle.getBrand())
                                                        .vehicleModel(vehicle.getModel())
                                                        .vehiclePlate(vehicle.getPlate())
                                                        .rentalCount(vehicleRentals.size())
                                                        .totalRevenue(totalRevenue)
                                                        .utilizationRate(utilizationRate)
                                                        .build();
                                })
                                .sorted(Comparator.comparing(BusinessMetricsDTO.TopVehicleDTO::getRentalCount)
                                                .reversed())
                                .limit(5)
                                .collect(Collectors.toList());

                // Cálculo da taxa média de utilização para o período filtrado
                double averageUtilizationRate = filteredVehicles.stream()
                                .mapToDouble(vehicle -> {
                                        List<Rental> vehicleRentals = rentalsByVehicle.getOrDefault(vehicle,
                                                        new ArrayList<>());

                                        long daysRented = vehicleRentals.stream()
                                                        .filter(r -> r.getStartDate() != null &&
                                                                        (r.getActualReturnDate() != null
                                                                                        || r.getEndDate() != null))
                                                        .mapToLong(r -> {
                                                                LocalDateTime start = r.getStartDate()
                                                                                .isBefore(periodStart)
                                                                                                ? periodStart
                                                                                                : r.getStartDate();
                                                                LocalDateTime end = r.getActualReturnDate() != null
                                                                                ? r.getActualReturnDate()
                                                                                : r.getEndDate();
                                                                if (end.isAfter(periodEnd))
                                                                        end = periodEnd;
                                                                return Math.max(0,
                                                                                Duration.between(start, end).toDays());
                                                        })
                                                        .sum();

                                        return (double) daysRented / effectiveDaysInPeriod * 100;
                                })
                                .average()
                                .orElse(0.0);

                return BusinessMetricsDTO.VehicleMetrics.builder()
                                .totalVehicles(totalVehicles)
                                .availableVehicles(availableVehicles)
                                .unavailableVehicles(unavailableVehicles)
                                .vehiclesByCategory(vehiclesByCategory)
                                .vehiclesByStatus(vehiclesByStatus)
                                .mostRentedVehicles(mostRentedVehicles)
                                .averageUtilizationRate(averageUtilizationRate)
                                .build();
        }

        @Transactional(readOnly = true)
        private BusinessMetricsDTO.DiscountMetrics calculateDiscountMetrics(LocalDateTime periodStart,
                        LocalDateTime periodEnd, String category, String status) {
                // Filtrar aluguéis pelo período e outros filtros
                List<Rental> allRentals = rentalRepository.findAll();
                List<Rental> filteredRentals = allRentals.stream()
                                .filter(rental -> {
                                        // Aplicar filtro de período - verificar se há interseção
                                        boolean inPeriod = rental.getStartDate() != null &&
                                                        rental.getEndDate() != null &&
                                                        !(rental.getEndDate().isBefore(periodStart) ||
                                                                        rental.getStartDate().isAfter(periodEnd));

                                        // Aplicar filtro de categoria, se fornecido
                                        boolean matchesCategory = category == null || category.isEmpty() ||
                                                        (rental.getVehicle() != null &&
                                                                        rental.getVehicle().getCategory() != null &&
                                                                        rental.getVehicle().getCategory().name()
                                                                                        .equals(category));

                                        // Aplicar filtro de status, se fornecido
                                        boolean matchesStatus = status == null || status.isEmpty() ||
                                                        (rental.getStatus() != null &&
                                                                        rental.getStatus().name().equals(status));

                                        return inPeriod && matchesCategory && matchesStatus;
                                })
                                .collect(Collectors.toList());

                // Restante do código para calcular métricas de desconto usando filteredRentals
                // Simular dados de desconto (já que não existe na entidade Rental)
                List<Rental> rentalsWithDiscount = filteredRentals.stream()
                                .filter(r -> r.getTotalAmount() != null && r.getOriginalTotalAmount() != null &&
                                                r.getOriginalTotalAmount().compareTo(r.getTotalAmount()) > 0)
                                .collect(Collectors.toList());

                long totalDiscountsApplied = rentalsWithDiscount.size();

                BigDecimal totalDiscountAmount = rentalsWithDiscount.stream()
                                .map(r -> r.getOriginalTotalAmount().subtract(r.getTotalAmount()))
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                double averageDiscountPercentage = rentalsWithDiscount.stream()
                                .mapToDouble(r -> {
                                        BigDecimal discountAmount = r.getOriginalTotalAmount()
                                                        .subtract(r.getTotalAmount());
                                        return discountAmount
                                                        .divide(r.getOriginalTotalAmount(), 4, RoundingMode.HALF_UP)
                                                        .multiply(BigDecimal.valueOf(100))
                                                        .doubleValue();
                                })
                                .average()
                                .orElse(0.0);

                // Simular tipos de desconto
                Map<String, Long> discountsByType = new HashMap<>();
                discountsByType.put("FIDELIDADE", rentalsWithDiscount.size() / 2L);
                discountsByType.put("PROMOCIONAL", rentalsWithDiscount.size() / 3L);
                discountsByType.put("SAZONAL", rentalsWithDiscount.size() / 6L);
                discountsByType.put("ESPECIAL", rentalsWithDiscount.size() -
                                (discountsByType.get("FIDELIDADE") +
                                                discountsByType.get("PROMOCIONAL") +
                                                discountsByType.get("SAZONAL")));

                // Simular distribuição de desconto
                List<BusinessMetricsDTO.DiscountDistributionDTO> discountDistribution = new ArrayList<>();
                discountDistribution.add(new BusinessMetricsDTO.DiscountDistributionDTO("0-5%",
                                rentalsWithDiscount.size() / 4, totalDiscountAmount.multiply(BigDecimal.valueOf(0.2))));
                discountDistribution.add(new BusinessMetricsDTO.DiscountDistributionDTO("5-10%",
                                rentalsWithDiscount.size() / 3, totalDiscountAmount.multiply(BigDecimal.valueOf(0.3))));
                discountDistribution.add(
                                new BusinessMetricsDTO.DiscountDistributionDTO("10-15%", rentalsWithDiscount.size() / 4,
                                                totalDiscountAmount.multiply(BigDecimal.valueOf(0.25))));
                discountDistribution.add(
                                new BusinessMetricsDTO.DiscountDistributionDTO("15%+", rentalsWithDiscount.size() / 6,
                                                totalDiscountAmount.multiply(BigDecimal.valueOf(0.25))));

                return BusinessMetricsDTO.DiscountMetrics.builder()
                                .totalDiscountsApplied(totalDiscountsApplied)
                                .totalDiscountAmount(totalDiscountAmount)
                                .averageDiscountPercentage(BigDecimal.valueOf(averageDiscountPercentage))
                                .discountsByType(discountsByType)
                                .discountDistribution(discountDistribution)
                                .build();
        }
}