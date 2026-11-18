package com.rowzero.backend.movie;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MovieRepository
        extends JpaRepository<Movie, Long> {

    Optional<Movie> findByTmdbId(Long tmdbId);

    boolean existsByTmdbId(Long tmdbId);

    Page<Movie> findByVisibleTrue(
            Pageable pageable
    );

    Page<Movie> findByVisibleTrueAndTitleContainingIgnoreCase(
            String title,
            Pageable pageable
    );

    Page<Movie> findByTitleContainingIgnoreCase(
            String title,
            Pageable pageable
    );

    Page<Movie> findByVisible(
            boolean visible,
            Pageable pageable
    );

    Page<Movie> findByTitleContainingIgnoreCaseAndVisible(
            String title,
            boolean visible,
            Pageable pageable
    );
}