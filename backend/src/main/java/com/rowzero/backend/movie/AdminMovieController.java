package com.rowzero.backend.movie;

import com.rowzero.backend.movie.dto.MoviePageResponse;
import com.rowzero.backend.movie.dto.MovieResponse;
import com.rowzero.backend.movie.dto.UpdateMovieRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/movies")
@Validated
public class AdminMovieController {

    private final MovieService movieService;

    public AdminMovieController(
            MovieService movieService
    ) {
        this.movieService = movieService;
    }

    @GetMapping
    public MoviePageResponse getAll(
            @RequestParam(required = false)
            String search,

            @RequestParam(required = false)
            Boolean visible,

            @RequestParam(defaultValue = "0")
            @Min(0)
            int page,

            @RequestParam(defaultValue = "20")
            @Min(1)
            @Max(100)
            int size
    ) {
        return movieService.getAll(
                search,
                visible,
                page,
                size
        );
    }

    @GetMapping("/{id}")
    public MovieResponse getById(
            @PathVariable Long id
    ) {
        return movieService.getById(id);
    }

    @PutMapping("/{id}")
    public MovieResponse update(
            @PathVariable Long id,
            @Valid @RequestBody
            UpdateMovieRequest request
    ) {
        return movieService.update(
                id,
                request
        );
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id
    ) {
        movieService.delete(id);
    }
}