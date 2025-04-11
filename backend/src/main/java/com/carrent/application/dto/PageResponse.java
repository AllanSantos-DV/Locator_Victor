package com.carrent.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * DTO para respostas paginadas da API
 * 
 * @param <T> Tipo do conteúdo da página
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    /**
     * Cria uma resposta paginada a partir de uma página do Spring Data
     * 
     * @param <U>  Tipo do conteúdo da página
     * @param page Página do Spring Data
     * @return Resposta paginada
     */
    public static <U> PageResponse<U> fromPage(Page<U> page) {
        return PageResponse.<U>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}