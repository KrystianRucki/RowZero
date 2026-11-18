package com.rowzero.backend.tmdb;

import com.rowzero.backend.tmdb.dto.TmdbMovieDetails;
import com.rowzero.backend.tmdb.dto.TmdbMovieSearchItemResponse;
import com.rowzero.backend.tmdb.dto.TmdbMovieSearchPageResponse;
import com.rowzero.backend.tmdb.dto.TmdbMovieSummary;
import com.rowzero.backend.tmdb.dto.TmdbSearchResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class TmdbService {

    private final TmdbClient tmdbClient;

    public TmdbService(
            TmdbClient tmdbClient
    ) {
        this.tmdbClient = tmdbClient;
    }

    public TmdbMovieSearchPageResponse searchMovies(
            String query,
            int page
    ) {
        TmdbSearchResponse response =
                tmdbClient.searchMovies(
                        query.trim(),
                        page
                );

        List<TmdbMovieSearchItemResponse> results =
                response.results() == null
                        ? List.of()
                        : response.results()
                        .stream()
                        .map(this::mapSearchResult)
                        .toList();

        return new TmdbMovieSearchPageResponse(
                results,
                response.page(),
                response.totalPages(),
                response.totalResults()
        );
    }

    public TmdbMovieDetails getMovieDetails(
            Long tmdbId
    ) {
        return tmdbClient
                .getMovieDetails(tmdbId);
    }

    private TmdbMovieSearchItemResponse mapSearchResult(
            TmdbMovieSummary movie
    ) {
        return new TmdbMovieSearchItemResponse(
                movie.id(),
                movie.title(),
                movie.originalTitle(),
                movie.overview(),
                parseDate(movie.releaseDate()),
                movie.posterPath(),
                movie.backdropPath()
        );
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