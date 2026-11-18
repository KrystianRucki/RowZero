package com.rowzero.backend.movie;

import com.rowzero.backend.movie.dto.MoviePageResponse;
import com.rowzero.backend.movie.dto.MovieResponse;
import com.rowzero.backend.movie.dto.UpdateMovieRequest;
import com.rowzero.backend.screening.ScreeningRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class MovieService {

    private final MovieRepository movieRepository;
    private final ScreeningRepository screeningRepository;

    public MovieService(
            MovieRepository movieRepository,
            ScreeningRepository screeningRepository
    ) {
        this.movieRepository = movieRepository;
        this.screeningRepository = screeningRepository;
    }

    @Transactional(readOnly = true)
    public MoviePageResponse getAll(
            String search,
            Boolean visible,
            int page,
            int size
    ) {
        String normalizedSearch =
                search == null || search.isBlank()
                        ? null
                        : search.trim();

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Direction.ASC,
                        "title"
                )
        );

        Page<Movie> movies;

        if (normalizedSearch != null && visible != null) {

            movies = movieRepository
                    .findByTitleContainingIgnoreCaseAndVisible(
                            normalizedSearch,
                            visible,
                            pageable
                    );

        } else if (normalizedSearch != null) {

            movies = movieRepository
                    .findByTitleContainingIgnoreCase(
                            normalizedSearch,
                            pageable
                    );

        } else if (visible != null) {

            movies = movieRepository
                    .findByVisible(
                            visible,
                            pageable
                    );

        } else {

            movies = movieRepository.findAll(pageable);
        }

        Page<MovieResponse> result =
                movies.map(MovieResponse::from);

        return MoviePageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public MovieResponse getById(Long id) {

        return MovieResponse.from(
                getMovie(id)
        );
    }

    @Transactional
    public MovieResponse update(
            Long id,
            UpdateMovieRequest request
    ) {
        Movie movie = getMovie(id);

        movie.setTitle(
                request.title().trim()
        );

        movie.setOriginalTitle(
                normalizeOptionalText(
                        request.originalTitle()
                )
        );

        movie.setOverview(
                normalizeOptionalText(
                        request.overview()
                )
        );

        movie.setRuntime(
                request.runtime()
        );

        movie.setReleaseDate(
                request.releaseDate()
        );

        movie.setPosterPath(
                normalizeOptionalText(
                        request.posterPath()
                )
        );

        movie.setBackdropPath(
                normalizeOptionalText(
                        request.backdropPath()
                )
        );

        movie.setVisible(
                request.visible()
        );

        return MovieResponse.from(movie);
    }

    @Transactional
    public void delete(Long id) {

        Movie movie = getMovie(id);

        if (screeningRepository
                .existsByMovie_Id(id)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Movie cannot be deleted because it is used by screenings"
            );
        }

        movieRepository.delete(movie);
    }

    private Movie getMovie(Long id) {

        return movieRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Movie not found"
                        )
                );
    }

    private String normalizeOptionalText(
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
}