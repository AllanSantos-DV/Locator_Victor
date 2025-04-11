package com.carrent.web.controller.admin;

import com.carrent.application.dto.AuthenticationResponse;
import com.carrent.application.dto.UserDTO;
import com.carrent.application.dto.admin.NotificationRequest;
import com.carrent.application.dto.admin.UserCreateRequest;
import com.carrent.application.dto.admin.UserUpdateRequest;
import com.carrent.application.service.admin.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Tag(name = "Administração de Usuários", description = "API para administradores gerenciarem usuários")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    @Operation(summary = "Lista usuários não-administradores")
    @ApiResponse(responseCode = "200", description = "Lista de usuários retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserDTO.class))))
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/all")
    @Operation(summary = "Lista todos os usuários, incluindo administradores")
    @ApiResponse(responseCode = "200", description = "Lista completa de usuários retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserDTO.class))))
    public ResponseEntity<List<UserDTO>> getAllUsersIncludingAdmins() {
        return ResponseEntity.ok(adminUserService.getAllUsersIncludingAdmins());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um usuário por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário encontrado com sucesso", content = @Content(schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    @Parameter(name = "id", description = "ID do usuário", required = true)
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Cria um novo usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso", content = @Content(schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "409", description = "Email já cadastrado")
    })
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserCreateRequest userCreateRequest) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminUserService.createUser(userCreateRequest));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza um usuário existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário atualizado com sucesso", content = @Content(schema = @Schema(implementation = UserDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
            @ApiResponse(responseCode = "409", description = "Email já cadastrado")
    })
    @Parameter(name = "id", description = "ID do usuário", required = true)
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest userUpdateRequest) {
        return ResponseEntity.ok(adminUserService.updateUser(id, userUpdateRequest));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove um usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Usuário removido com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
            @ApiResponse(responseCode = "400", description = "Usuário não pode ser removido")
    })
    @Parameter(name = "id", description = "ID do usuário", required = true)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/notify")
    @Operation(summary = "Envia uma notificação para um usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Notificação enviada com sucesso"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado"),
            @ApiResponse(responseCode = "400", description = "Dados da notificação inválidos")
    })
    @Parameter(name = "id", description = "ID do usuário", required = true)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> notifyUser(
            @PathVariable Long id,
            @Valid @RequestBody NotificationRequest notificationRequest) {
        adminUserService.notifyUser(id, notificationRequest);
        return ResponseEntity.noContent().build();
    }
}