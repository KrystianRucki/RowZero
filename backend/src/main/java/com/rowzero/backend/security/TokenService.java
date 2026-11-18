package com.rowzero.backend.security;

import com.rowzero.backend.user.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TokenService {

    private final JwtEncoder jwtEncoder;
    private final String issuer;
    private final long expirationSeconds;

    public TokenService(
            JwtEncoder jwtEncoder,
            @Value("${app.security.jwt.issuer}") String issuer,
            @Value("${app.security.jwt.expiration-seconds}")
            long expirationSeconds
    ) {
        this.jwtEncoder = jwtEncoder;
        this.issuer = issuer;
        this.expirationSeconds = expirationSeconds;
    }

    public String generateToken(User user) {

        Instant issuedAt = Instant.now();
        Instant expiresAt =
                issuedAt.plusSeconds(expirationSeconds);

        JwsHeader header = JwsHeader
                .with(MacAlgorithm.HS256)
                .build();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim(
                        "roles",
                        List.of(user.getRole().name())
                )
                .build();

        return jwtEncoder.encode(
                        JwtEncoderParameters.from(
                                header,
                                claims
                        )
                )
                .getTokenValue();
    }

    public long getExpirationSeconds() {
        return expirationSeconds;
    }
}