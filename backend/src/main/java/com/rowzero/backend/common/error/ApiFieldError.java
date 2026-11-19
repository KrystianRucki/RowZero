package com.rowzero.backend.common.error;

public record ApiFieldError(
        String field,
        String message
) {
}