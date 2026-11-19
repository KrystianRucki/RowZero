package com.rowzero.backend.security;

import tools.jackson.databind.ObjectMapper;
import com.rowzero.backend.common.error.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
public class RestAccessDeniedHandler
        implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RestAccessDeniedHandler(
            ObjectMapper objectMapper
    ) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException exception
    ) throws IOException {

        ApiErrorResponse error =
                new ApiErrorResponse(
                        OffsetDateTime.now(
                                ZoneOffset.UTC
                        ),
                        HttpStatus.FORBIDDEN.value(),
                        HttpStatus.FORBIDDEN.getReasonPhrase(),
                        "Access denied",
                        request.getRequestURI(),
                        List.of()
                );

        response.setStatus(
                HttpStatus.FORBIDDEN.value()
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