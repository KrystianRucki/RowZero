package com.rowzero.backend.common.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger logger =
            LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
            ResponseStatusException exception,
            HttpServletRequest request
    ) {
        HttpStatusCode statusCode =
                exception.getStatusCode();

        String message =
                exception.getReason() != null
                        ? exception.getReason()
                        : getReasonPhrase(statusCode);

        return ResponseEntity
                .status(statusCode)
                .body(
                        createResponse(
                                statusCode,
                                message,
                                request,
                                List.of()
                        )
                );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        List<ApiFieldError> fieldErrors =
                exception
                        .getBindingResult()
                        .getFieldErrors()
                        .stream()
                        .map(error ->
                                new ApiFieldError(
                                        error.getField(),
                                        error.getDefaultMessage()
                                )
                        )
                        .toList();

        return ResponseEntity
                .badRequest()
                .body(
                        createResponse(
                                HttpStatus.BAD_REQUEST,
                                "Validation failed",
                                request,
                                fieldErrors
                        )
                );
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        List<ApiFieldError> fieldErrors =
                exception
                        .getConstraintViolations()
                        .stream()
                        .map(violation ->
                                new ApiFieldError(
                                        violation
                                                .getPropertyPath()
                                                .toString(),
                                        violation.getMessage()
                                )
                        )
                        .toList();

        return ResponseEntity
                .badRequest()
                .body(
                        createResponse(
                                HttpStatus.BAD_REQUEST,
                                "Validation failed",
                                request,
                                fieldErrors
                        )
                );
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodValidation(
            HandlerMethodValidationException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .badRequest()
                .body(
                        createResponse(
                                HttpStatus.BAD_REQUEST,
                                "Validation failed",
                                request,
                                List.of()
                        )
                );
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        String message =
                "Invalid value for parameter '"
                        + exception.getName()
                        + "'";

        return ResponseEntity
                .badRequest()
                .body(
                        createResponse(
                                HttpStatus.BAD_REQUEST,
                                message,
                                request,
                                List.of()
                        )
                );
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleMessageNotReadable(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .badRequest()
                .body(
                        createResponse(
                                HttpStatus.BAD_REQUEST,
                                "Malformed request body",
                                request,
                                List.of()
                        )
                );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        createResponse(
                                HttpStatus.CONFLICT,
                                "Database constraint violation",
                                request,
                                List.of()
                        )
                );
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoResourceFound(
            NoResourceFoundException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        createResponse(
                                HttpStatus.NOT_FOUND,
                                "Endpoint not found",
                                request,
                                List.of()
                        )
                );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(
            Exception exception,
            HttpServletRequest request
    ) {
        logger.error(
                "Unhandled exception",
                exception
        );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        createResponse(
                                HttpStatus.INTERNAL_SERVER_ERROR,
                                "Internal server error",
                                request,
                                List.of()
                        )
                );
    }

    private ApiErrorResponse createResponse(
            HttpStatusCode statusCode,
            String message,
            HttpServletRequest request,
            List<ApiFieldError> fieldErrors
    ) {
        return new ApiErrorResponse(
                OffsetDateTime.now(
                        ZoneOffset.UTC
                ),
                statusCode.value(),
                getReasonPhrase(statusCode),
                message,
                request.getRequestURI(),
                fieldErrors
        );
    }

    private String getReasonPhrase(
            HttpStatusCode statusCode
    ) {
        HttpStatus status =
                HttpStatus.resolve(
                        statusCode.value()
                );

        return status != null
                ? status.getReasonPhrase()
                : "Error";
    }
}