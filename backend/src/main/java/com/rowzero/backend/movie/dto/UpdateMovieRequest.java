package com.rowzero.backend.movie.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateMovieRequest(

        @NotBlank
        @Size(max = 255)
        String title,

        @Size(max = 255)
        String originalTitle,

        String overview,

        @Min(1)
        Integer runtime,

        LocalDate releaseDate,

        @Size(max = 500)
        String posterPath,

        @Size(max = 500)
        String backdropPath,

        @NotNull
        Boolean visible

) {
}