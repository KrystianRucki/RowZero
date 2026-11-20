package com.rowzero.backend.reservation;

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

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ReservationApiIntegrationTest
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
                    9_000_000L
            );

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void reservationShouldBeCreatedAndConfirmed()
            throws Exception {

        long testId =
                SEQUENCE.incrementAndGet();

        String email =
                "reservation-" +
                        testId +
                        "@rowzero.test";

        register(
                email
        );

        String token =
                login(
                        email
                );

        ScreeningFixture fixture =
                createScreeningFixture(
                        testId
                );

        MvcResult createResult =
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
                                                        fixture.screeningSeatId()
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
                        .andExpect(
                                jsonPath("$.screeningId")
                                        .value(
                                                fixture.screeningId()
                                        )
                        )
                        .andReturn();

        long reservationId =
                extractId(
                        createResult
                                .getResponse()
                                .getContentAsString()
                );

        mockMvc.perform(
                        post(
                                "/api/reservations/{id}/confirm",
                                reservationId
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
                        jsonPath("$.id")
                                .value(
                                        reservationId
                                )
                )
                .andExpect(
                        jsonPath("$.status")
                                .value("CONFIRMED")
                );
    }

    @Test
    void secondUserShouldNotReserveSameSeat()
            throws Exception {

        long testId =
                SEQUENCE.incrementAndGet();

        String firstEmail =
                "seat-first-" +
                        testId +
                        "@rowzero.test";

        String secondEmail =
                "seat-second-" +
                        testId +
                        "@rowzero.test";

        register(
                firstEmail
        );

        register(
                secondEmail
        );

        String firstToken =
                login(
                        firstEmail
                );

        String secondToken =
                login(
                        secondEmail
                );

        ScreeningFixture fixture =
                createScreeningFixture(
                        testId
                );

        mockMvc.perform(
                        post(
                                "/api/reservations"
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + firstToken
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        reservationBody(
                                                fixture.screeningSeatId()
                                        )
                                )
                )
                .andExpect(
                        status().isCreated()
                )
                .andExpect(
                        jsonPath("$.status")
                                .value("HELD")
                );

        mockMvc.perform(
                        post(
                                "/api/reservations"
                        )
                                .header(
                                        "Authorization",
                                        "Bearer " + secondToken
                                )
                                .contentType(
                                        MediaType.APPLICATION_JSON
                                )
                                .content(
                                        reservationBody(
                                                fixture.screeningSeatId()
                                        )
                                )
                )
                .andExpect(
                        status().isConflict()
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Seat is already reserved"
                                )
                );
    }

    @Test
    void userShouldNotReserveSecondSeatForSameScreening()
            throws Exception {

        long testId =
                SEQUENCE.incrementAndGet();

        String email =
                "same-screening-" +
                        testId +
                        "@rowzero.test";

        register(
                email
        );

        String token =
                login(
                        email
                );

        ScreeningFixture fixture =
                createScreeningFixture(
                        testId
                );

        Long secondScreeningSeatId =
                createAdditionalSeat(
                        fixture.hallId(),
                        fixture.screeningId(),
                        "B",
                        2
                );

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
                                                fixture.screeningSeatId()
                                        )
                                )
                )
                .andExpect(
                        status().isCreated()
                );

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
                                                secondScreeningSeatId
                                        )
                                )
                )
                .andExpect(
                        status().isConflict()
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "User already has a reservation for this screening"
                                )
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
                        "Integration Test Movie " + testId,
                        "Integration Test Movie " + testId,
                        "Movie created for integration tests",
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
                        "Integration Hall " + testId
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
                ).plusDays(2);

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
                hallId,
                screeningId,
                screeningSeatId
        );
    }

    private Long createAdditionalSeat(
            Long hallId,
            Long screeningId,
            String rowLabel,
            int number
    ) {
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
                        rowLabel,
                        number,
                        true
                );

        return jdbcTemplate.queryForObject(
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
            Long hallId,
            Long screeningId,
            Long screeningSeatId
    ) {
    }
}