package com.carrent.web.controller;

import com.carrent.application.dto.NotificationDTO;
import com.carrent.application.dto.PageResponse;
import com.carrent.application.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Validated
@Tag(name = "Notificações", description = "API para gerenciamento de notificações do usuário")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Listar notificações do usuário autenticado", description = "Retorna todas as notificações do usuário autenticado com paginação")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notificações listadas com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    public ResponseEntity<PageResponse<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        return ResponseEntity.ok(notificationService.getUserNotifications(page, size));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Contagem de notificações não lidas", description = "Retorna o número de notificações não lidas para o usuário autenticado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Contagem realizada com sucesso", content = @Content(schema = @Schema(implementation = Long.class))),
            @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsCount());
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Marcar notificação como lida", description = "Marca uma notificação específica como lida")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notificação marcada como lida com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado"),
            @ApiResponse(responseCode = "404", description = "Notificação não encontrada")
    })
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Marcar todas as notificações como lidas", description = "Marca todas as notificações do usuário autenticado como lidas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Notificações marcadas como lidas com sucesso"),
            @ApiResponse(responseCode = "401", description = "Não autorizado")
    })
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllNotificationsAsRead();
        return ResponseEntity.ok().build();
    }
}