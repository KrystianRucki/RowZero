package com.rowzero.backend.user.dto;

import com.rowzero.backend.user.User;
import com.rowzero.backend.user.UserRole;

import java.time.OffsetDateTime;

public record AdminUserResponse(
        Long id,
        String email,
        UserRole role,
        boolean enabled,
        OffsetDateTime createdAt
) {

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getCreatedAt()
        );
    }
}