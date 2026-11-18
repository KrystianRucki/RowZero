package com.rowzero.backend.movie;

import com.rowzero.backend.movie.dto.MovieResponse;
import com.rowzero.backend.tmdb.TmdbService;
import com.rowzero.backend.tmdb.dto.TmdbMovieDetails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;

@Service
public class MovieTmdbService {

    private final MovieRepository movieRepository;
    private final TmdbService tmdbService;

    public MovieTmdbService(
            MovieRepository movieRepository,
            TmdbService tmdbService
    ) {
        this.movieRepository = movieRepository;
        this.tmdbService = tmdbService;
    }

    @Transactional
    public MovieResponse importMovie(
            Long tmdbId
    ) {
        if (movieRepository.existsByTmdbId(tmdbId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Movie is already imported"
            );
        }

        TmdbMovieDetails details =
                tmdbService.getMovieDetails(
                        tmdbId
                );

        OffsetDateTime now =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                );

        Movie movie = new Movie(
                details.id(),
                details.title(),
                normalizeText(
                        details.originalTitle()
                ),
                normalizeText(
                        details.overview()
                ),
                normalizeRuntime(
                        details.runtime()
                ),
                parseDate(
                        details.releaseDate()
                ),
                normalizeText(
                        details.posterPath()
                ),
                normalizeText(
                        details.backdropPath()
                ),
                true,
                now
        );

        Movie savedMovie =
                movieRepository.save(movie);

        return MovieResponse.from(
                savedMovie
        );
    }

    @Transactional
    public MovieResponse refreshMovie(
            Long id
    ) {
        Movie movie = movieRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Movie not found"
                        )
                );

        TmdbMovieDetails details =
                tmdbService.getMovieDetails(
                        movie.getTmdbId()
                );

        movie.setTitle(
                details.title()
        );

        movie.setOriginalTitle(
                normalizeText(
                        details.originalTitle()
                )
        );

        movie.setOverview(
                normalizeText(
                        details.overview()
                )
        );

        movie.setRuntime(
                normalizeRuntime(
                        details.runtime()
                )
        );

        movie.setReleaseDate(
                parseDate(
                        details.releaseDate()
                )
        );

        movie.setPosterPath(
                normalizeText(
                        details.posterPath()
                )
        );

        movie.setBackdropPath(
                normalizeText(
                        details.backdropPath()
                )
        );

        movie.setLastSyncedAt(
                OffsetDateTime.now(
                        ZoneOffset.UTC
                )
        );

        return MovieResponse.from(movie);
    }

    private String normalizeText(
            String value
    ) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty()
                ? null
                : trimmed;
    }

    private Integer normalizeRuntime(
            Integer runtime
    ) {
        if (runtime == null || runtime <= 0) {
            return null;
        }

        return runtime;
    }

    private LocalDate parseDate(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return LocalDate.parse(value);

        } catch (DateTimeParseException exception) {
            return null;
        }
    }
}