package com.carrent.web.exception;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    private List<String> details;

    public static ErrorResponseBuilder builder() {
        return new ErrorResponseBuilder()
                .timestamp(LocalDateTime.now());
    }
}