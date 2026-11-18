package com.rowzero.backend.auth.dto;

import com.rowzero.backend.user.UserResponse;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user
) {
}