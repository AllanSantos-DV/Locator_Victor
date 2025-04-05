package com.carrent.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Resposta de erro padronizada")
public class ErrorResponse {

    @Schema(description = "Código HTTP do erro")
    private int status;

    @Schema(description = "Mensagem de erro")
    private String message;

    @Schema(description = "Data e hora do erro")
    private LocalDateTime timestamp;

    @Schema(description = "Lista de erros detalhados")
    private List<String> errors;
}