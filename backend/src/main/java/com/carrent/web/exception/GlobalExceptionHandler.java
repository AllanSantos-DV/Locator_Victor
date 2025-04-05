package com.carrent.web.exception;

import com.carrent.domain.exception.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.SQLGrammarException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.validation.FieldError;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ApiError> handleIllegalStateException(IllegalStateException ex) {
                log.error("Erro de estado inválido: {}", ex.getMessage());
                return createErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ApiError> handleIllegalArgumentException(IllegalArgumentException ex) {
                log.error("Erro de argumento inválido: {}", ex.getMessage());
                return createErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        @ExceptionHandler(RentalNotFoundException.class)
        public ResponseEntity<ApiError> handleRentalNotFoundException(RentalNotFoundException ex) {
                log.error("Aluguel não encontrado: {}", ex.getMessage());
                return createErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
        }

        @ExceptionHandler(CustomerNotFoundException.class)
        public ResponseEntity<ApiError> handleCustomerNotFoundException(CustomerNotFoundException ex) {
                log.error("Cliente não encontrado: {}", ex.getMessage());
                return createErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
        }

        @ExceptionHandler(VehicleNotFoundException.class)
        public ResponseEntity<ApiError> handleVehicleNotFoundException(VehicleNotFoundException ex) {
                log.error("Veículo não encontrado: {}", ex.getMessage());
                return createErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
        }

        @ExceptionHandler(VehicleNotAvailableException.class)
        public ResponseEntity<ApiError> handleVehicleNotAvailableException(VehicleNotAvailableException ex) {
                log.error("Veículo não disponível: {}", ex.getMessage());
                return createErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
        }

        @ExceptionHandler(DuplicateResourceException.class)
        public ResponseEntity<ApiError> handleDuplicateResourceException(DuplicateResourceException ex) {
                log.error("Recurso duplicado: {}", ex.getMessage());
                return createErrorResponse(HttpStatus.CONFLICT, ex.getMessage());
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
                Map<String, String> errors = new HashMap<>();
                ex.getBindingResult().getAllErrors().forEach((error) -> {
                        String fieldName = ((FieldError) error).getField();
                        String errorMessage = error.getDefaultMessage();
                        errors.put(fieldName, errorMessage);
                });
                log.error("Erro de validação: {}", errors);
                return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
        }

        @ExceptionHandler(ConstraintViolationException.class)
        public ResponseEntity<ErrorResponse> handleConstraintViolationException(
                        ConstraintViolationException ex,
                        HttpServletRequest request) {
                List<String> errors = ex.getConstraintViolations()
                                .stream()
                                .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                                .collect(Collectors.toList());

                log.error("Violação de restrição: {}", errors);
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .error("Violação de restrição")
                                                .message("Dados inválidos")
                                                .path(request.getRequestURI())
                                                .details(errors)
                                                .build());
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(
                        HttpMessageNotReadableException ex,
                        HttpServletRequest request) {
                String message = "Erro na formatação do JSON";
                if (ex.getCause() instanceof InvalidFormatException cause) {
                        message = String.format("Valor inválido '%s' para o campo '%s', tipo esperado: %s",
                                        cause.getValue(),
                                        cause.getPath().isEmpty() ? "desconhecido"
                                                        : cause.getPath().get(0).getFieldName(),
                                        cause.getTargetType().getSimpleName());
                } else if (ex.getCause() instanceof JsonProcessingException) {
                        message = "Formato JSON inválido: " + ex.getCause().getMessage();
                }

                log.error("Erro na leitura do JSON: {}", message);
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .error("Formato inválido")
                                                .message(message)
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(
                        MethodArgumentTypeMismatchException ex,
                        HttpServletRequest request) {
                String message = String.format("Parâmetro '%s' com valor '%s' não pôde ser convertido para o tipo %s",
                                ex.getName(), ex.getValue(),
                                Objects.requireNonNull(ex.getRequiredType()).getSimpleName());

                log.error("Tipo de argumento incompatível: {}", message);
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .error("Tipo de argumento incompatível")
                                                .message(message)
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(BadCredentialsException.class)
        public ResponseEntity<ErrorResponse> handleBadCredentialsException(
                        BadCredentialsException ex,
                        HttpServletRequest request) {
                log.error("Credenciais inválidas: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.UNAUTHORIZED.value())
                                                .error("Credenciais inválidas")
                                                .message("Usuário ou senha incorretos")
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ErrorResponse> handleAuthenticationException(
                        AuthenticationException ex,
                        HttpServletRequest request) {
                log.error("Erro de autenticação: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.UNAUTHORIZED.value())
                                                .error("Erro de autenticação")
                                                .message("Falha na autenticação. Verifique suas credenciais.")
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAccessDeniedException(
                        AccessDeniedException ex,
                        HttpServletRequest request) {
                log.error("Acesso negado: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.FORBIDDEN.value())
                                                .error("Acesso negado")
                                                .message("Você não tem permissão para acessar este recurso.")
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(InsufficientAuthenticationException.class)
        public ResponseEntity<ErrorResponse> handleInsufficientAuthenticationException(
                        InsufficientAuthenticationException ex,
                        HttpServletRequest request) {
                log.error("Autenticação insuficiente: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.UNAUTHORIZED.value())
                                                .error("Autenticação insuficiente")
                                                .message("É necessário autenticar-se para acessar este recurso")
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(NullPointerException.class)
        public ResponseEntity<ErrorResponse> handleNullPointerException(
                        NullPointerException ex,
                        HttpServletRequest request) {
                // Registra o erro com a stack trace no log, mas não a expõe ao cliente
                log.error("NullPointerException: ", ex);

                String message = "Ocorreu um erro de referência nula";
                if (ex.getMessage() != null) {
                        message = message + ": " + ex.getMessage();
                }

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .error("Erro de referência nula")
                                                .message(message)
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler({ SQLException.class, DataAccessException.class, BadSqlGrammarException.class,
                        SQLGrammarException.class })
        public ResponseEntity<ErrorResponse> handleDatabaseException(
                        Exception ex,
                        HttpServletRequest request) {
                log.error("Erro de banco de dados: ", ex);

                String message = "Erro ao acessar o banco de dados";

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .error("Erro de banco de dados")
                                                .message(message)
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler({ DataIntegrityViolationException.class,
                        org.hibernate.exception.ConstraintViolationException.class })
        public ResponseEntity<ErrorResponse> handleIntegrityConstraintException(
                        Exception ex,
                        HttpServletRequest request) {
                log.error("Violação de integridade: ", ex);

                String message = "Operação não pode ser concluída devido a restrições de integridade do banco de dados";

                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.CONFLICT.value())
                                                .error("Violação de integridade")
                                                .message(message)
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(JsonProcessingException.class)
        public ResponseEntity<ErrorResponse> handleJsonProcessingException(
                        JsonProcessingException ex,
                        HttpServletRequest request) {
                log.error("Erro no processamento de JSON: ", ex);

                String message = "Erro ao processar JSON: formato inválido";
                if (ex.getMessage() != null) {
                        message = message + " - " + ex.getOriginalMessage();
                }

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .error("Formato JSON inválido")
                                                .message(message)
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(java.io.IOException.class)
        public ResponseEntity<ErrorResponse> handleIOException(
                        java.io.IOException ex,
                        HttpServletRequest request) {
                log.error("Erro de operação de I/O: ", ex);

                String message = "Erro ao acessar arquivo ou recurso";
                if (ex.getMessage() != null) {
                        message = message + ": " + ex.getMessage();
                }

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .error("Erro de I/O")
                                                .message(message)
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler({ org.springframework.orm.jpa.JpaSystemException.class,
                        jakarta.persistence.EntityNotFoundException.class })
        public ResponseEntity<ErrorResponse> handleJpaException(
                        Exception ex,
                        HttpServletRequest request) {
                log.error("Erro de JPA: ", ex);

                String message = "Erro ao acessar entidade no banco de dados";

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .error("Erro de acesso a dados")
                                                .message(message)
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ApiError> handleGenericException(Exception ex) {
                log.error("Erro interno do servidor: {}", ex.getMessage());
                return createErrorResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.");
        }

        @ExceptionHandler({ JwtException.class, ExpiredJwtException.class })
        public ResponseEntity<ErrorResponse> handleJwtException(
                        JwtException ex,
                        HttpServletRequest request) {
                log.error("Erro de token JWT: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.UNAUTHORIZED.value())
                                                .error("Token inválido ou expirado")
                                                .message("O token fornecido é inválido ou expirou")
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(org.springframework.web.servlet.NoHandlerFoundException.class)
        public ResponseEntity<ErrorResponse> handleNoHandlerFoundException(
                        org.springframework.web.servlet.NoHandlerFoundException ex,
                        HttpServletRequest request) {
                log.error("Recurso não encontrado: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.NOT_FOUND.value())
                                                .error("Recurso não encontrado")
                                                .message("O recurso solicitado não foi encontrado")
                                                .path(request.getRequestURI())
                                                .build());
        }

        @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
        public ResponseEntity<ErrorResponse> handleNoResourceFoundException(
                        org.springframework.web.servlet.resource.NoResourceFoundException ex,
                        HttpServletRequest request) {
                log.error("Recurso estático não encontrado: {}", ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(ErrorResponse.builder()
                                                .status(HttpStatus.NOT_FOUND.value())
                                                .error("Recurso não encontrado")
                                                .message("O recurso estático solicitado não foi encontrado")
                                                .path(request.getRequestURI())
                                                .build());
        }

        private ResponseEntity<ApiError> createErrorResponse(HttpStatus status, String message) {
                ApiError error = new ApiError(
                                status.value(),
                                status.getReasonPhrase(),
                                message,
                                LocalDateTime.now());
                return new ResponseEntity<>(error, status);
        }

        public record ApiError(
                        int status,
                        String error,
                        String message,
                        LocalDateTime timestamp) {
        }
}