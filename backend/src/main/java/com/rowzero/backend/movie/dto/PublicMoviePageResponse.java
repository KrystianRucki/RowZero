package com.rowzero.backend.movie.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record PublicMoviePageResponse(
        List<PublicMovieResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    public static PublicMoviePageResponse from(
            Page<PublicMovieResponse> page
    ) {
        return new PublicMoviePageResponse(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}