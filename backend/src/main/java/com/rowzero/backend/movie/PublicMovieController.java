package com.rowzero.backend.movie;

import com.rowzero.backend.movie.dto.PublicMoviePageResponse;
import com.rowzero.backend.movie.dto.PublicMovieResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
@Validated
public class PublicMovieController {

    private final MovieService movieService;

    public PublicMovieController(
            MovieService movieService
    ) {
        this.movieService = movieService;
    }

    @GetMapping
    public PublicMoviePageResponse getMovies(
            @RequestParam(required = false)
            String search,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        return movieService.getPublicMovies(
                search,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public PublicMovieResponse getMovie(
            @PathVariable Long id
    ) {
        return movieService.getPublicMovie(id);
    }
}