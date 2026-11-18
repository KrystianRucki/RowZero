package com.rowzero.backend.tmdb;

import com.rowzero.backend.tmdb.dto.TmdbMovieSearchPageResponse;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tmdb/movies")
@Validated
public class AdminTmdbController {

    private final TmdbService tmdbService;

    public AdminTmdbController(
            TmdbService tmdbService
    ) {
        this.tmdbService = tmdbService;
    }

    @GetMapping("/search")
    public TmdbMovieSearchPageResponse searchMovies(

            @RequestParam
            @NotBlank
            @Size(max = 200)
            String query,

            @RequestParam(defaultValue = "1")
            @Min(1)
            int page
    ) {
        return tmdbService.searchMovies(
                query,
                page
        );
    }
}