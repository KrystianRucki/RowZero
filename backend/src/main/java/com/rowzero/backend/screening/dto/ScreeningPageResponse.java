package com.rowzero.backend.screening.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record ScreeningPageResponse(
        List<ScreeningResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    public static ScreeningPageResponse from(
            Page<ScreeningResponse> page
    ) {
        return new ScreeningPageResponse(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}