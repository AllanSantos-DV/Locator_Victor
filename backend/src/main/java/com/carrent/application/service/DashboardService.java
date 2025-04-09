package com.carrent.application.service;

import com.carrent.application.dto.DashboardResponse;
import com.carrent.domain.entity.Rental;
import com.carrent.domain.entity.RentalStatus;
import com.carrent.domain.entity.Vehicle;
import com.carrent.domain.repository.CustomerRepository;
import com.carrent.domain.repository.RentalRepository;
import com.carrent.domain.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

        private final VehicleRepository vehicleRepository;
        private final CustomerRepository customerRepository;
        private final RentalRepository rentalRepository;
        private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

        public DashboardResponse getDashboardData(int page, int size) {
                long totalVehicles = vehicleRepository.count();
                long availableVehicles = vehicleRepository.findByAvailableTrue().size();
                long totalClients = customerRepository.count();

                List<Rental> activeRentals = rentalRepository.findByStatus(RentalStatus.IN_PROGRESS);

                // Criar ordenação: IN_PROGRESS primeiro, depois PENDING, depois os demais
                Sort sort = Sort.by(Sort.Direction.ASC, "status")
                                .and(Sort.by(Sort.Direction.DESC, "startDate"));

                // Buscar aluguéis paginados
                Page<Rental> rentalPage = rentalRepository.findAllWithCustomersAndVehicles(
                                PageRequest.of(page, size, sort));

                // Mapear para DTOs
                List<DashboardResponse.RecentRental> recentRentalDtos = rentalPage.getContent().stream()
                                .map(this::mapToRecentRental)
                                .collect(Collectors.toList());

                // Ordenar manualmente para garantir a ordem correta dos status
                Comparator<DashboardResponse.RecentRental> statusComparator = (r1, r2) -> {
                        String status1 = r1.getStatus();
                        String status2 = r2.getStatus();

                        // Definir prioridade dos status
                        Map<String, Integer> priorities = Map.of(
                                        "IN_PROGRESS", 0,
                                        "PENDING", 1,
                                        "COMPLETED", 2,
                                        "CANCELLED", 3);

                        int priority1 = priorities.getOrDefault(status1, 4);
                        int priority2 = priorities.getOrDefault(status2, 4);

                        return Integer.compare(priority1, priority2);
                };

                Comparator<DashboardResponse.RecentRental> dateComparator = (r1, r2) -> r2.getStartDate()
                                .compareTo(r1.getStartDate());

                recentRentalDtos.sort(statusComparator.thenComparing(dateComparator));

                // Criar objeto de paginação
                DashboardResponse.RecentRentalsPage recentRentalsPage = DashboardResponse.RecentRentalsPage.builder()
                                .content(recentRentalDtos)
                                .totalPages(rentalPage.getTotalPages())
                                .totalElements(rentalPage.getTotalElements())
                                .currentPage(page)
                                .pageSize(size)
                                .build();

                return DashboardResponse.builder()
                                .totalVehicles((int) totalVehicles)
                                .availableVehicles((int) availableVehicles)
                                .totalClients((int) totalClients)
                                .activeRentals(activeRentals.size())
                                .recentRentals(recentRentalsPage)
                                .build();
        }

        private DashboardResponse.RecentRental mapToRecentRental(Rental rental) {
                try {
                        String clientName = "Cliente não definido";
                        if (rental.getCustomer() != null) {
                                clientName = rental.getCustomer().getName() != null ? rental.getCustomer().getName()
                                                : "Nome não definido";
                        }

                        String vehicleModel = "Veículo não definido";
                        if (rental.getVehicle() != null) {
                                Vehicle vehicle = rental.getVehicle();
                                if (vehicle.getBrand() != null && vehicle.getModel() != null) {
                                        vehicleModel = vehicle.getBrand() + " " + vehicle.getModel();
                                }
                        }

                        return DashboardResponse.RecentRental.builder()
                                        .id(rental.getId())
                                        .clientName(clientName)
                                        .vehicleModel(vehicleModel)
                                        .startDate(rental.getStartDate() != null
                                                        ? rental.getStartDate().format(dateFormatter)
                                                        : "Data não definida")
                                        .endDate(rental.getEndDate() != null ? rental.getEndDate().format(dateFormatter)
                                                        : "Data não definida")
                                        .status(rental.getStatus() != null ? rental.getStatus().name()
                                                        : "Status não definido")
                                        .build();
                } catch (Exception e) {
                        // Log error but don't break dashboard
                        log.error("Erro ao mapear aluguel para o dashboard: {}", e.getMessage());
                        return DashboardResponse.RecentRental.builder()
                                        .id(rental.getId())
                                        .clientName("Erro ao carregar")
                                        .vehicleModel("Erro ao carregar")
                                        .startDate("Indisponível")
                                        .endDate("Indisponível")
                                        .status("ERRO")
                                        .build();
                }
        }
}