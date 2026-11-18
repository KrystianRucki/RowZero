package com.rowzero.backend.tmdb.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TmdbSearchResponse(

        int page,

        List<TmdbMovieSummary> results,

        @JsonProperty("total_pages")
        int totalPages,

        @JsonProperty("total_results")
        int totalResults

) {
}