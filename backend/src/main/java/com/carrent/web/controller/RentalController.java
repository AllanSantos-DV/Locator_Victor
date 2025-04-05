package com.carrent.web.controller;

import com.carrent.application.dto.RentalDTO;
import com.carrent.application.service.RentalService;
import com.carrent.domain.entity.RentalStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/rentals")
@RequiredArgsConstructor
@Tag(name = "Aluguéis", description = "API para gerenciamento de aluguéis")
@Validated
public class RentalController {

    private final RentalService rentalService;

    @GetMapping
    @Operation(summary = "Lista todos os aluguéis")
    @ApiResponse(responseCode = "200", description = "Lista de aluguéis retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RentalDTO.class))))
    public ResponseEntity<List<RentalDTO>> findAll() {
        return ResponseEntity.ok(rentalService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um aluguel por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Aluguel encontrado com sucesso", content = @Content(schema = @Schema(implementation = RentalDTO.class))),
            @ApiResponse(responseCode = "404", description = "Aluguel não encontrado")
    })
    @Parameter(name = "id", description = "ID do aluguel", required = true)
    public ResponseEntity<RentalDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.findById(id));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Lista aluguéis por cliente")
    @ApiResponse(responseCode = "200", description = "Lista de aluguéis por cliente retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RentalDTO.class))))
    @Parameter(name = "customerId", description = "ID do cliente", required = true)
    public ResponseEntity<List<RentalDTO>> findByCustomerId(@PathVariable Long customerId) {
        return ResponseEntity.ok(rentalService.findByCustomerId(customerId));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Lista aluguéis por veículo")
    @ApiResponse(responseCode = "200", description = "Lista de aluguéis por veículo retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RentalDTO.class))))
    @Parameter(name = "vehicleId", description = "ID do veículo", required = true)
    public ResponseEntity<List<RentalDTO>> findByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(rentalService.findByVehicleId(vehicleId));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lista aluguéis por status")
    @ApiResponse(responseCode = "200", description = "Lista de aluguéis por status retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RentalDTO.class))))
    @Parameter(name = "status", description = "Status do aluguel", required = true)
    public ResponseEntity<List<RentalDTO>> findByStatus(@PathVariable RentalStatus status) {
        return ResponseEntity.ok(rentalService.findByStatus(status));
    }

    @GetMapping("/period")
    @Operation(summary = "Lista aluguéis por período")
    @ApiResponse(responseCode = "200", description = "Lista de aluguéis por período retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = RentalDTO.class))))
    @Parameter(name = "start", description = "Data inicial", required = true)
    @Parameter(name = "end", description = "Data final", required = true)
    public ResponseEntity<List<RentalDTO>> findByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) @Future LocalDateTime end) {
        return ResponseEntity.ok(rentalService.findByPeriod(start, end));
    }

    @PostMapping
    @Operation(summary = "Cria um novo aluguel")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Aluguel criado com sucesso", content = @Content(schema = @Schema(implementation = RentalDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Cliente ou veículo não encontrado"),
            @ApiResponse(responseCode = "409", description = "Veículo não disponível no período")
    })
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<RentalDTO> create(@Valid @RequestBody RentalDTO rentalDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(rentalService.create(rentalDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um aluguel existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Aluguel atualizado com sucesso", content = @Content(schema = @Schema(implementation = RentalDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Aluguel não encontrado"),
            @ApiResponse(responseCode = "409", description = "Veículo não disponível no período")
    })
    @Parameter(name = "id", description = "ID do aluguel", required = true)
    public ResponseEntity<RentalDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody RentalDTO rentalDTO) {
        return ResponseEntity.ok(rentalService.update(id, rentalDTO));
    }

    @PatchMapping("/{id}/start")
    @Operation(summary = "Inicia um aluguel")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Aluguel iniciado com sucesso", content = @Content(schema = @Schema(implementation = RentalDTO.class))),
            @ApiResponse(responseCode = "404", description = "Aluguel não encontrado"),
            @ApiResponse(responseCode = "400", description = "Aluguel não pode ser iniciado")
    })
    @Parameter(name = "id", description = "ID do aluguel", required = true)
    public ResponseEntity<RentalDTO> startRental(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.startRental(id));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Finaliza um aluguel")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Aluguel finalizado com sucesso", content = @Content(schema = @Schema(implementation = RentalDTO.class))),
            @ApiResponse(responseCode = "404", description = "Aluguel não encontrado"),
            @ApiResponse(responseCode = "400", description = "Aluguel não pode ser finalizado")
    })
    @Parameter(name = "id", description = "ID do aluguel", required = true)
    public ResponseEntity<RentalDTO> completeRental(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.completeRental(id));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancela um aluguel")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Aluguel cancelado com sucesso", content = @Content(schema = @Schema(implementation = RentalDTO.class))),
            @ApiResponse(responseCode = "404", description = "Aluguel não encontrado"),
            @ApiResponse(responseCode = "400", description = "Aluguel não pode ser cancelado")
    })
    @Parameter(name = "id", description = "ID do aluguel", required = true)
    public ResponseEntity<RentalDTO> cancelRental(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.cancelRental(id));
    }
}