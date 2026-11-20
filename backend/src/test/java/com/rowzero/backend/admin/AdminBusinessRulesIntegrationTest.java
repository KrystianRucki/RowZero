package com.rowzero.backend.admin;

import com.rowzero.backend.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class AdminBusinessRulesIntegrationTest
        extends AbstractIntegrationTest {

    private static final String PASSWORD =
            "StrongPassword123!";

    private static final Pattern JWT_PATTERN =
            Pattern.compile(
                    "eyJ[A-Za-z0-9._-]+"
            );

    private static final Pattern ID_PATTERN =
            Pattern.compile(
                    "\"id\"\\s*:\\s*(\\d+)"
            );

    private static final AtomicLong SEQUENCE =
            new AtomicLong(
                    29_000_000L
            );

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void deactivatingUserShouldCancelFutureActiveReservation()
            throws Exception {

        long testId =
                SEQUENCE.incrementAndGet();

        String adminEmail =
                "admin-deactivate-" +
                        testId +
                        "@rowzero.test";

        String userEmail =
                "user-deactivate-" +
                        testId +
                        "@rowzero.test";

        String adminToken =
                createAdmin(
                        adminEmail
                );

        register(
                userEmail
        );

        String userToken =
                login(
                        userEmail
                );

        Long userId =
                findUserId(
                        userEmail
                );

        ScreeningFixture fixture =
                createScreeningFixture(
                        testId
                );

        long reservationId =
                createReservation(
                        userToken,
                        fixture.screeningSeatId()
                );

        mockMvc.perform(
                        patch(
                                "/api/admin/users/{id}",
                                userId
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + adminToken
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "enabled": false
                                        }
                                        """
                                )
                )
                .andExpect(
                        status().is2xxSuccessful()
                );

        Boolean enabled =
                jdbcTemplate.queryForObject(
                        """
                        SELECT enabled
                        FROM users
                        WHERE id = ?
                        """,
                        Boolean.class,
                        userId
                );

        String reservationStatus =
                jdbcTemplate.queryForObject(
                        """
                        SELECT status
                        FROM reservations
                        WHERE id = ?
                        """,
                        String.class,
                        reservationId
                );

        Boolean hasCancelledAt =
                jdbcTemplate.queryForObject(
                        """
                        SELECT cancelled_at IS NOT NULL
                        FROM reservations
                        WHERE id = ?
                        """,
                        Boolean.class,
                        reservationId
                );

        assertFalse(
                enabled
        );

        assertEquals(
                "CANCELLED",
                reservationStatus
        );

        assertTrue(
                hasCancelledAt
        );
    }

    @Test
    void reactivatingUserShouldNotRestoreCancelledReservation()
            throws Exception {

        long testId =
                SEQUENCE.incrementAndGet();

        String adminEmail =
                "admin-reactivate-" +
                        testId +
                        "@rowzero.test";

        String userEmail =
                "user-reactivate-" +
                        testId +
                        "@rowzero.test";

        String adminToken =
                createAdmin(
                        adminEmail
                );

        register(
                userEmail
        );

        String userToken =
                login(
                        userEmail
                );

        Long userId =
                findUserId(
                        userEmail
                );

        ScreeningFixture fixture =
                createScreeningFixture(
                        testId
                );

        long reservationId =
                createReservation(
                        userToken,
                        fixture.screeningSeatId()
                );

        mockMvc.perform(
                        patch(
                                "/api/admin/users/{id}",
                                userId
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + adminToken
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "enabled": false
                                        }
                                        """
                                )
                )
                .andExpect(
                        status().is2xxSuccessful()
                );

        mockMvc.perform(
                        patch(
                                "/api/admin/users/{id}",
                                userId
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + adminToken
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        """
                                        {
                                          "enabled": true
                                        }
                                        """
                                )
                )
                .andExpect(
                        status().is2xxSuccessful()
                );

        Boolean enabled =
                jdbcTemplate.queryForObject(
                        """
                        SELECT enabled
                        FROM users
                        WHERE id = ?
                        """,
                        Boolean.class,
                        userId
                );

        String reservationStatus =
                jdbcTemplate.queryForObject(
                        """
                        SELECT status
                        FROM reservations
                        WHERE id = ?
                        """,
                        String.class,
                        reservationId
                );

        assertTrue(
                enabled
        );

        assertEquals(
                "CANCELLED",
                reservationStatus
        );
    }

    @Test
    void cancellingScreeningShouldCancelConfirmedReservation()
            throws Exception {

        long testId =
                SEQUENCE.incrementAndGet();

        String adminEmail =
                "admin-screening-" +
                        testId +
                        "@rowzero.test";

        String userEmail =
                "user-screening-" +
                        testId +
                        "@rowzero.test";

        String adminToken =
                createAdmin(
                        adminEmail
                );

        register(
                userEmail
        );

        String userToken =
                login(
                        userEmail
                );

        ScreeningFixture fixture =
                createScreeningFixture(
                        testId
                );

        long reservationId =
                createReservation(
                        userToken,
                        fixture.screeningSeatId()
                );

        mockMvc.perform(
                        post(
                                "/api/reservations/{id}/confirm",
                                reservationId
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + userToken
                                )
                )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$.status")
                                .value("CONFIRMED")
                );

        mockMvc.perform(
                        delete(
                                "/api/admin/screenings/{id}",
                                fixture.screeningId()
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + adminToken
                                )
                )
                .andExpect(
                        status().is2xxSuccessful()
                );

        String screeningStatus =
                jdbcTemplate.queryForObject(
                        """
                        SELECT status
                        FROM screenings
                        WHERE id = ?
                        """,
                        String.class,
                        fixture.screeningId()
                );

        String reservationStatus =
                jdbcTemplate.queryForObject(
                        """
                        SELECT status
                        FROM reservations
                        WHERE id = ?
                        """,
                        String.class,
                        reservationId
                );

        Boolean hasCancelledAt =
                jdbcTemplate.queryForObject(
                        """
                        SELECT cancelled_at IS NOT NULL
                        FROM reservations
                        WHERE id = ?
                        """,
                        Boolean.class,
                        reservationId
                );

        assertEquals(
                "CANCELLED",
                screeningStatus
        );

        assertEquals(
                "CANCELLED",
                reservationStatus
        );

        assertTrue(
                hasCancelledAt
        );
    }

    private String createAdmin(
            String email
    ) throws Exception {

        register(
                email
        );

        jdbcTemplate.update(
                """
                UPDATE users
                SET role = 'ADMIN'
                WHERE email = ?
                """,
                email
        );

        return login(
                email
        );
    }

    private long createReservation(
            String token,
            Long screeningSeatId
    ) throws Exception {

        MvcResult result =
                mockMvc.perform(
                                post(
                                        "/api/reservations"
                                )
                                        .header(
                                                "Authorization",
                                                "Bearer " + token
                                        )
                                        .contentType(
                                                MediaType.APPLICATION_JSON
                                        )
                                        .content(
                                                reservationBody(
                                                        screeningSeatId
                                                )
                                        )
                        )
                        .andExpect(
                                status().isCreated()
                        )
                        .andExpect(
                                jsonPath("$.status")
                                        .value("HELD")
                        )
                        .andReturn();

        return extractId(
                result
                        .getResponse()
                        .getContentAsString()
        );
    }

    private ScreeningFixture createScreeningFixture(
            long testId
    ) {
        Long movieId =
                jdbcTemplate.queryForObject(
                        """
                        INSERT INTO movies (
                            tmdb_id,
                            title,
                            original_title,
                            overview,
                            runtime,
                            release_date,
                            poster_path,
                            backdrop_path,
                            visible,
                            last_synced_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        RETURNING id
                        """,
                        Long.class,
                        testId,
                        "Admin Test Movie " + testId,
                        "Admin Test Movie " + testId,
                        "Movie created for admin integration test",
                        120,
                        java.sql.Date.valueOf(
                                "2026-01-01"
                        ),
                        "/test-poster.jpg",
                        "/test-backdrop.jpg",
                        true,
                        OffsetDateTime.now(
                                ZoneOffset.UTC
                        )
                );

        Long hallId =
                jdbcTemplate.queryForObject(
                        """
                        INSERT INTO halls (
                            name
                        )
                        VALUES (?)
                        RETURNING id
                        """,
                        Long.class,
                        "Admin Test Hall " + testId
                );

        Long seatId =
                jdbcTemplate.queryForObject(
                        """
                        INSERT INTO seats (
                            hall_id,
                            row_label,
                            number,
                            active
                        )
                        VALUES (?, ?, ?, ?)
                        RETURNING id
                        """,
                        Long.class,
                        hallId,
                        "A",
                        1,
                        true
                );

        OffsetDateTime startAt =
                OffsetDateTime.now(
                        ZoneOffset.UTC
                ).plusDays(4);

        OffsetDateTime endAt =
                startAt.plusHours(2);

        Long screeningId =
                jdbcTemplate.queryForObject(
                        """
                        INSERT INTO screenings (
                            movie_id,
                            hall_id,
                            start_at,
                            end_at,
                            status
                        )
                        VALUES (?, ?, ?, ?, ?)
                        RETURNING id
                        """,
                        Long.class,
                        movieId,
                        hallId,
                        startAt,
                        endAt,
                        "SCHEDULED"
                );

        Long screeningSeatId =
                jdbcTemplate.queryForObject(
                        """
                        INSERT INTO screening_seats (
                            screening_id,
                            seat_id
                        )
                        VALUES (?, ?)
                        RETURNING id
                        """,
                        Long.class,
                        screeningId,
                        seatId
                );

        return new ScreeningFixture(
                screeningId,
                screeningSeatId
        );
    }

    private Long findUserId(
            String email
    ) {
        return jdbcTemplate.queryForObject(
                """
                SELECT id
                FROM users
                WHERE email = ?
                """,
                Long.class,
                email
        );
    }

    private void register(
            String email
    ) throws Exception {

        mockMvc.perform(
                        post(
                                "/api/auth/register"
                        )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        authBody(
                                                email
                                        )
                                )
                )
                .andExpect(
                        status().isCreated()
                );
    }

    private String login(
            String email
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
                                                authBody(
                                                        email
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

    private long extractId(
            String body
    ) {
        Matcher matcher =
                ID_PATTERN.matcher(
                        body
                );

        assertTrue(
                matcher.find(),
                "Response does not contain an id"
        );

        return Long.parseLong(
                matcher.group(1)
        );
    }

    private String authBody(
            String email
    ) {
        return """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(
                email,
                PASSWORD
        );
    }

    private String reservationBody(
            Long screeningSeatId
    ) {
        return """
                {
                  "screeningSeatId": %d
                }
                """.formatted(
                screeningSeatId
        );
    }

    private record ScreeningFixture(
            Long screeningId,
            Long screeningSeatId
    ) {
    }
}