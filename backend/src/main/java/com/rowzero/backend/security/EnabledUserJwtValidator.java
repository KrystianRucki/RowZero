package com.rowzero.backend.security;

import com.rowzero.backend.user.User;
import com.rowzero.backend.user.UserRepository;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class EnabledUserJwtValidator
        implements OAuth2TokenValidator<Jwt> {

    private final UserRepository userRepository;

    public EnabledUserJwtValidator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2TokenValidatorResult validate(Jwt jwt) {
        try {
            Long userId = Long.valueOf(jwt.getSubject());

            return userRepository.findById(userId)
                    .filter(User::isEnabled)
                    .map(user -> OAuth2TokenValidatorResult.success())
                    .orElseGet(this::failure);

        } catch (NumberFormatException exception) {
            return failure();
        }
    }

    private OAuth2TokenValidatorResult failure() {
        OAuth2Error error = new OAuth2Error(
                "invalid_token",
                "User does not exist or is disabled",
                null
        );

        return OAuth2TokenValidatorResult.failure(error);
    }
}