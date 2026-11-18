package com.rowzero.backend.tmdb.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TmdbMovieDetails(

        Long id,

        String title,

        @JsonProperty("original_title")
        String originalTitle,

        String overview,

        Integer runtime,

        @JsonProperty("release_date")
        String releaseDate,

        @JsonProperty("poster_path")
        String posterPath,

        @JsonProperty("backdrop_path")
        String backdropPath

) {
}