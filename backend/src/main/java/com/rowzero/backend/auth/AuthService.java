package com.rowzero.backend.auth;

import com.rowzero.backend.auth.dto.AuthResponse;
import com.rowzero.backend.auth.dto.LoginRequest;
import com.rowzero.backend.auth.dto.RegisterRequest;
import com.rowzero.backend.security.TokenService;
import com.rowzero.backend.user.User;
import com.rowzero.backend.user.UserRepository;
import com.rowzero.backend.user.UserResponse;
import com.rowzero.backend.user.UserRole;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            TokenService tokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    public AuthResponse register(RegisterRequest request) {

        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.password()),
                UserRole.USER,
                OffsetDateTime.now(ZoneOffset.UTC)
        );

        User savedUser = userRepository.save(user);

        return createResponse(savedUser);
    }

    public AuthResponse login(LoginRequest request) {

        String email = normalizeEmail(request.email());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            email,
                            request.password()
                    )
            );
        } catch (AuthenticationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED
                        )
                );

        return createResponse(user);
    }

    private AuthResponse createResponse(User user) {

        return new AuthResponse(
                tokenService.generateToken(user),
                "Bearer",
                tokenService.getExpirationSeconds(),
                UserResponse.from(user)
        );
    }

    private String normalizeEmail(String email) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}