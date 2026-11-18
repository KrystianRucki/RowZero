package com.rowzero.backend.tmdb;

import com.rowzero.backend.tmdb.dto.TmdbMovieDetails;
import com.rowzero.backend.tmdb.dto.TmdbSearchResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Component
public class TmdbClient {

    private final RestClient restClient;
    private final String language;
    private final boolean configured;

    public TmdbClient(
            RestClient.Builder restClientBuilder,

            @Value("${app.tmdb.base-url}")
            String baseUrl,

            @Value("${app.tmdb.read-token:}")
            String readToken,

            @Value("${app.tmdb.language:en-US}")
            String language
    ) {
        this.language = language;

        RestClient.Builder builder =
                restClientBuilder
                        .baseUrl(baseUrl)
                        .defaultHeader(
                                HttpHeaders.ACCEPT,
                                MediaType.APPLICATION_JSON_VALUE
                        );

        this.configured =
                readToken != null
                        && !readToken.isBlank();

        if (configured) {
            builder.defaultHeader(
                    HttpHeaders.AUTHORIZATION,
                    "Bearer " + readToken
            );
        }

        this.restClient = builder.build();
    }

    public TmdbSearchResponse searchMovies(
            String query,
            int page
    ) {
        ensureConfigured();

        try {
            TmdbSearchResponse response =
                    restClient
                            .get()
                            .uri(uriBuilder ->
                                    uriBuilder
                                            .path("/search/movie")
                                            .queryParam(
                                                    "query",
                                                    query
                                            )
                                            .queryParam(
                                                    "page",
                                                    page
                                            )
                                            .queryParam(
                                                    "language",
                                                    language
                                            )
                                            .queryParam(
                                                    "include_adult",
                                                    false
                                            )
                                            .build()
                            )
                            .retrieve()
                            .body(
                                    TmdbSearchResponse.class
                            );

            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Empty response from TMDB"
                );
            }

            return response;

        } catch (RestClientResponseException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "TMDB request failed"
            );

        } catch (RestClientException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "TMDB service is unavailable"
            );
        }
    }

    public TmdbMovieDetails getMovieDetails(
            Long tmdbId
    ) {
        ensureConfigured();

        try {
            TmdbMovieDetails response =
                    restClient
                            .get()
                            .uri(uriBuilder ->
                                    uriBuilder
                                            .path("/movie/{id}")
                                            .queryParam(
                                                    "language",
                                                    language
                                            )
                                            .build(tmdbId)
                            )
                            .retrieve()
                            .body(
                                    TmdbMovieDetails.class
                            );

            if (response == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "Empty response from TMDB"
                );
            }

            return response;

        } catch (HttpClientErrorException.NotFound exception) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Movie not found in TMDB"
            );

        } catch (RestClientResponseException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "TMDB request failed"
            );

        } catch (RestClientException exception) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "TMDB service is unavailable"
            );
        }
    }

    private void ensureConfigured() {

        if (!configured) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "TMDB integration is not configured"
            );
        }
    }
}