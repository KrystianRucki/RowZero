package com.rowzero.backend.security;

import tools.jackson.databind.ObjectMapper;
import com.rowzero.backend.common.error.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
public class RestAuthenticationEntryPoint
        implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {

        ApiErrorResponse error =
                new ApiErrorResponse(
                        OffsetDateTime.now(
                                ZoneOffset.UTC
                        ),
                        HttpStatus.UNAUTHORIZED.value(),
                        HttpStatus.UNAUTHORIZED.getReasonPhrase(),
                        "Authentication required",
                        request.getRequestURI(),
                        List.of()
                );

        response.setStatus(
                HttpStatus.UNAUTHORIZED.value()
        );

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );

        objectMapper.writeValue(
                response.getOutputStream(),
                error
        );
    }
}