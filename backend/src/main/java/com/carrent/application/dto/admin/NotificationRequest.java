package com.carrent.application.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationRequest {

    @NotBlank(message = "Título é obrigatório")
    private String title;

    @NotBlank(message = "Conteúdo é obrigatório")
    private String content;

    @NotNull(message = "Tipo de notificação é obrigatório")
    private NotificationType type;

    public enum NotificationType {
        SYSTEM
    }
}