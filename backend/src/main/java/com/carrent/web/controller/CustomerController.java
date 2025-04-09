package com.carrent.web.controller;

import com.carrent.application.dto.CustomerDTO;
import com.carrent.application.service.CustomerService;
import com.carrent.domain.entity.Customer;
import com.carrent.domain.repository.RentalRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "API para gerenciamento de clientes")
@Validated
public class CustomerController {

        private final CustomerService customerService;
        private final RentalRepository rentalRepository;

        @GetMapping
        @Operation(summary = "Lista todos os clientes")
        @ApiResponse(responseCode = "200", description = "Lista de clientes retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = CustomerDTO.class))))
        public ResponseEntity<List<CustomerDTO>> findAll() {
                return ResponseEntity.ok(customerService.findAll());
        }

        @GetMapping("/{id}")
        @Operation(summary = "Busca um cliente por ID")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Cliente encontrado com sucesso", content = @Content(schema = @Schema(implementation = CustomerDTO.class))),
                        @ApiResponse(responseCode = "404", description = "Cliente não encontrado")
        })
        @Parameter(name = "id", description = "ID do cliente", required = true)
        public ResponseEntity<CustomerDTO> findById(@PathVariable Long id) {
                return ResponseEntity.ok(customerService.findById(id));
        }

        @GetMapping("/email/{email}")
        @Operation(summary = "Busca um cliente por email")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Cliente encontrado com sucesso", content = @Content(schema = @Schema(implementation = CustomerDTO.class))),
                        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
                        @ApiResponse(responseCode = "400", description = "Formato de email inválido")
        })
        @Parameter(name = "email", description = "Email do cliente", required = true)
        public ResponseEntity<CustomerDTO> findByEmail(
                        @PathVariable @Email(message = "Email inválido") String email) {
                return ResponseEntity.ok(customerService.findByEmail(email));
        }

        @GetMapping("/document/{document}")
        @Operation(summary = "Busca um cliente por documento")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Cliente encontrado com sucesso", content = @Content(schema = @Schema(implementation = CustomerDTO.class))),
                        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
                        @ApiResponse(responseCode = "400", description = "Formato de documento inválido")
        })
        @Parameter(name = "document", description = "Documento do cliente", required = true)
        public ResponseEntity<CustomerDTO> findByDocument(
                        @PathVariable @Pattern(regexp = "^\\d{11}$", message = "CPF deve conter 11 dígitos") String document) {
                return ResponseEntity.ok(customerService.findByDocument(document));
        }

        @PostMapping
        @Operation(summary = "Cria um novo cliente")
        @ApiResponses({
                        @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso", content = @Content(schema = @Schema(implementation = CustomerDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
                        @ApiResponse(responseCode = "409", description = "Email ou documento já cadastrado")
        })
        @ResponseStatus(HttpStatus.CREATED)
        public ResponseEntity<CustomerDTO> create(@Valid @RequestBody CustomerDTO customerDTO) {
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(customerService.create(customerDTO));
        }

        @PutMapping("/{id}")
        @Operation(summary = "Atualiza um cliente existente")
        @ApiResponses({
                        @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso", content = @Content(schema = @Schema(implementation = CustomerDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Dados inválidos"),
                        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
                        @ApiResponse(responseCode = "409", description = "Email ou documento já cadastrado")
        })
        @Parameter(name = "id", description = "ID do cliente", required = true)
        public ResponseEntity<CustomerDTO> update(
                        @PathVariable Long id,
                        @Valid @RequestBody CustomerDTO customerDTO) {
                return ResponseEntity.ok(customerService.update(id, customerDTO));
        }

        @DeleteMapping("/{id}")
        @Operation(summary = "Remove um cliente")
        @ApiResponses({
                        @ApiResponse(responseCode = "204", description = "Cliente removido com sucesso"),
                        @ApiResponse(responseCode = "404", description = "Cliente não encontrado"),
                        @ApiResponse(responseCode = "400", description = "Cliente não pode ser removido")
        })
        @Parameter(name = "id", description = "ID do cliente", required = true)
        @ResponseStatus(HttpStatus.NO_CONTENT)
        public ResponseEntity<Void> delete(@PathVariable Long id) {
                customerService.delete(id);
                return ResponseEntity.noContent().build();
        }

        @GetMapping("/{id}/active-rentals")
        public ResponseEntity<Boolean> hasActiveRentals(@PathVariable Long id) {
                boolean hasActiveRentals = rentalRepository.hasActiveRentals(id);
                return ResponseEntity.ok(hasActiveRentals);
        }
}