package com.rowzero.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthenticationConverter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler
    ) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                .authenticationEntryPoint(
                                        authenticationEntryPoint
                                )
                                .accessDeniedHandler(
                                        accessDeniedHandler
                                )
                )

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/movies/**",
                                "/api/screenings/**"
                        ).permitAll()

                        .requestMatchers("/api/admin/**")
                        .hasRole("ADMIN")

                        .requestMatchers("/error")
                        .permitAll()

                        .anyRequest()
                        .authenticated()
                )

                .oauth2ResourceServer(oauth ->
                        oauth
                                .authenticationEntryPoint(
                                        authenticationEntryPoint
                                )
                                .accessDeniedHandler(
                                        accessDeniedHandler
                                )
                                .jwt(jwt ->
                                        jwt.jwtAuthenticationConverter(
                                                jwtAuthenticationConverter
                                        )
                                )
                );

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories
                .createDelegatingPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(
            DatabaseUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );

        provider.setPasswordEncoder(
                passwordEncoder
        );

        return new ProviderManager(
                provider
        );
    }

    @Bean
    SecretKey jwtSecretKey(
            @Value("${app.security.jwt.secret}")
            String encodedSecret
    ) {
        byte[] keyBytes;

        try {
            keyBytes =
                    Base64.getDecoder()
                            .decode(encodedSecret);

        } catch (IllegalArgumentException exception) {

            throw new IllegalStateException(
                    "JWT_SECRET must be Base64 encoded",
                    exception
            );
        }

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must contain at least 32 bytes"
            );
        }

        return new SecretKeySpec(
                keyBytes,
                "HmacSHA256"
        );
    }

    @Bean
    JwtEncoder jwtEncoder(
            SecretKey secretKey
    ) {
        return NimbusJwtEncoder
                .withSecretKey(secretKey)
                .algorithm(
                        MacAlgorithm.HS256
                )
                .build();
    }

    @Bean
    JwtDecoder jwtDecoder(
            SecretKey secretKey,
            EnabledUserJwtValidator enabledUserJwtValidator,
            @Value("${app.security.jwt.issuer}")
            String issuer
    ) {
        NimbusJwtDecoder decoder =
                NimbusJwtDecoder
                        .withSecretKey(secretKey)
                        .macAlgorithm(
                                MacAlgorithm.HS256
                        )
                        .build();

        decoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(
                        JwtValidators
                                .createDefaultWithIssuer(
                                        issuer
                                ),
                        enabledUserJwtValidator
                )
        );

        return decoder;
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName(
                "roles"
        );

        authoritiesConverter.setAuthorityPrefix(
                "ROLE_"
        );

        JwtAuthenticationConverter authenticationConverter =
                new JwtAuthenticationConverter();

        authenticationConverter
                .setJwtGrantedAuthoritiesConverter(
                        authoritiesConverter
                );

        return authenticationConverter;
    }
}