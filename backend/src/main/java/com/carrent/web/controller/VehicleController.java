package com.carrent.web.controller;

import com.carrent.application.dto.VehicleDTO;
import com.carrent.application.service.VehicleService;
import com.carrent.domain.entity.VehicleCategory;
import com.carrent.domain.entity.VehicleStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
@Tag(name = "Veículos", description = "API para gerenciamento de veículos")
@Validated
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @Operation(summary = "Lista todos os veículos")
    @ApiResponse(responseCode = "200", description = "Lista de veículos retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = VehicleDTO.class))))
    public ResponseEntity<List<VehicleDTO>> findAll() {
        return ResponseEntity.ok(vehicleService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um veículo por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Veículo encontrado com sucesso", content = @Content(schema = @Schema(implementation = VehicleDTO.class))),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado")
    })
    @Parameter(name = "id", description = "ID do veículo", required = true)
    public ResponseEntity<VehicleDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.findById(id));
    }

    @GetMapping("/plate/{plate}")
    @Operation(summary = "Busca um veículo por placa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Veículo encontrado com sucesso", content = @Content(schema = @Schema(implementation = VehicleDTO.class))),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
            @ApiResponse(responseCode = "400", description = "Formato de placa inválido")
    })
    @Parameter(name = "plate", description = "Placa do veículo", required = true)
    public ResponseEntity<VehicleDTO> findByPlate(
            @PathVariable @Pattern(regexp = "^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$", message = "A placa deve estar no formato ABC1234 ou ABC1D23") String plate) {
        return ResponseEntity.ok(vehicleService.findByPlate(plate));
    }

    @GetMapping("/available")
    @Operation(summary = "Lista veículos disponíveis")
    @ApiResponse(responseCode = "200", description = "Lista de veículos disponíveis retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = VehicleDTO.class))))
    public ResponseEntity<List<VehicleDTO>> findAvailable() {
        return ResponseEntity.ok(vehicleService.findAvailable());
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Lista veículos por categoria")
    @ApiResponse(responseCode = "200", description = "Lista de veículos por categoria retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = VehicleDTO.class))))
    @Parameter(name = "category", description = "Categoria do veículo", required = true)
    public ResponseEntity<List<VehicleDTO>> findByCategory(@PathVariable VehicleCategory category) {
        return ResponseEntity.ok(vehicleService.findByCategory(category));
    }

    @PostMapping
    @Operation(summary = "Cria um novo veículo")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Veículo criado com sucesso", content = @Content(schema = @Schema(implementation = VehicleDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "409", description = "Placa já cadastrada")
    })
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<VehicleDTO> create(@Valid @RequestBody VehicleDTO vehicleDTO) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vehicleService.create(vehicleDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um veículo existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Veículo atualizado com sucesso", content = @Content(schema = @Schema(implementation = VehicleDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
            @ApiResponse(responseCode = "409", description = "Placa já cadastrada")
    })
    @Parameter(name = "id", description = "ID do veículo", required = true)
    public ResponseEntity<VehicleDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody VehicleDTO vehicleDTO) {
        return ResponseEntity.ok(vehicleService.update(id, vehicleDTO));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um veículo")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Veículo removido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado"),
            @ApiResponse(responseCode = "400", description = "Veículo não pode ser removido")
    })
    @Parameter(name = "id", description = "ID do veículo", required = true)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/availability")
    @Operation(summary = "Atualiza a disponibilidade de um veículo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Disponibilidade atualizada com sucesso", content = @Content(schema = @Schema(implementation = VehicleDTO.class))),
            @ApiResponse(responseCode = "404", description = "Veículo não encontrado")
    })
    @Parameter(name = "id", description = "ID do veículo", required = true)
    @Parameter(name = "available", description = "Status de disponibilidade", required = true)
    public ResponseEntity<VehicleDTO> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean available) {
        return ResponseEntity.ok(vehicleService.updateAvailability(id, available));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VehicleDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam VehicleStatus status) {
        VehicleDTO updatedVehicle = vehicleService.updateStatus(id, status);
        return ResponseEntity.ok(updatedVehicle);
    }
}