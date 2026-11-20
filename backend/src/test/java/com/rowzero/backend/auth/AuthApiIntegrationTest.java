package com.rowzero.backend.auth;

import com.rowzero.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class AuthApiIntegrationTest
        extends AbstractIntegrationTest {

    private static final String PASSWORD =
            "StrongPassword123!";

    private static final Pattern JWT_PATTERN =
            Pattern.compile(
                    "eyJ[A-Za-z0-9._-]+"
            );

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerAndLoginShouldReturnUsableJwt()
            throws Exception {

        String email =
                "auth-user@rowzero.test";

        register(
                email,
                PASSWORD
        );

        String token =
                login(
                        email,
                        PASSWORD
                );

        mockMvc.perform(
                        get(
                                "/api/users/me"
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$.email")
                                .value(email)
                )
                .andExpect(
                        jsonPath("$.role")
                                .value("USER")
                );
    }

    @Test
    void protectedEndpointShouldRejectMissingJwt()
            throws Exception {

        mockMvc.perform(
                        get(
                                "/api/reservations/my"
                        )
                )
                .andExpect(
                        status().isUnauthorized()
                );
    }

    @Test
    void userShouldBeForbiddenFromAdminEndpoint()
            throws Exception {

        String email =
                "normal-user@rowzero.test";

        register(
                email,
                PASSWORD
        );

        String token =
                login(
                        email,
                        PASSWORD
                );

        mockMvc.perform(
                        get(
                                "/api/admin/users"
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + token
                                )
                )
                .andExpect(
                        status().isForbidden()
                );
    }

    @Test
    void duplicateRegistrationShouldReturnConflict()
            throws Exception {

        String email =
                "duplicate-user@rowzero.test";

        register(
                email,
                PASSWORD
        );

        mockMvc.perform(
                        post(
                                "/api/auth/register"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        registerBody(
                                                email,
                                                PASSWORD
                                        )
                                )
                )
                .andExpect(
                        status().isConflict()
                );
    }

    private void register(
            String email,
            String password
    ) throws Exception {

        mockMvc.perform(
                        post(
                                "/api/auth/register"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        registerBody(
                                                email,
                                                password
                                        )
                                )
                )
                .andExpect(
                        status().isCreated()
                );
    }

    private String login(
            String email,
            String password
    ) throws Exception {

        MvcResult result =
                mockMvc.perform(
                                post(
                                        "/api/auth/login"
                                )
                                        .contentType(
                                                MediaType.APPLICATION_JSON
                                        )
                                        .content(
                                                loginBody(
                                                        email,
                                                        password
                                                )
                                        )
                        )
                        .andExpect(
                                status().isOk()
                        )
                        .andReturn();

        String body =
                result
                        .getResponse()
                        .getContentAsString();

        Matcher matcher =
                JWT_PATTERN.matcher(
                        body
                );

        assertTrue(
                matcher.find(),
                "Login response does not contain a JWT"
        );

        return matcher.group();
    }

    private String registerBody(
            String email,
            String password
    ) {
        return """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(
                email,
                password
        );
    }

    private String loginBody(
            String email,
            String password
    ) {
        return """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(
                email,
                password
        );
    }
}