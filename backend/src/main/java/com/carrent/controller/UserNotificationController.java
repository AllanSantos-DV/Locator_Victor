package com.carrent.controller;

import com.carrent.application.dto.NotificationDTO;
import com.carrent.application.dto.PageResponse;
import com.carrent.application.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user/notifications")
@RequiredArgsConstructor
@Tag(name = "Notificações do Usuário", description = "Endpoints para gerenciar notificações do usuário")
public class UserNotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Listar notificações do usuário autenticado", description = "Retorna todas as notificações do usuário autenticado, com suporte a paginação")
    public ResponseEntity<PageResponse<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) int size) {
        return ResponseEntity.ok(notificationService.getUserNotifications(page, size));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Contagem de notificações não lidas", description = "Retorna o número de notificações não lidas para o usuário autenticado")
    public ResponseEntity<Long> getUnreadCount() {
        return ResponseEntity.ok(notificationService.getUnreadNotificationsCount());
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Marcar notificação como lida", description = "Marca uma notificação específica como lida")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasRole('USER')")
    @Operation(summary = "Marcar todas as notificações como lidas", description = "Marca todas as notificações do usuário autenticado como lidas")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllNotificationsAsRead();
        return ResponseEntity.ok().build();
    }
}