package com.rowzero.backend.movie;

import com.rowzero.backend.movie.dto.MovieResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/movies")
public class AdminMovieTmdbController {

    private final MovieTmdbService movieTmdbService;

    public AdminMovieTmdbController(
            MovieTmdbService movieTmdbService
    ) {
        this.movieTmdbService = movieTmdbService;
    }

    @PostMapping("/import/{tmdbId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MovieResponse importMovie(
            @PathVariable Long tmdbId
    ) {
        return movieTmdbService
                .importMovie(tmdbId);
    }

    @PostMapping("/{id}/refresh")
    public MovieResponse refreshMovie(
            @PathVariable Long id
    ) {
        return movieTmdbService
                .refreshMovie(id);
    }
}