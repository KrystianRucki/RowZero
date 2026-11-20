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
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class ReservationConcurrencyIntegrationTest
        extends AbstractIntegrationTest {

    private static final String PASSWORD =
            "StrongPassword123!";

    private static final Pattern JWT_PATTERN =
            Pattern.compile(
                    "eyJ[A-Za-z0-9._-]+"
            );

    private static final AtomicLong SEQUENCE =
            new AtomicLong(
                    19_000_000L
            );

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void concurrentReservationAttemptsShouldAllowOnlyOneUser()
            throws Exception {

        long testId =
                SEQUENCE.incrementAndGet();

        String firstEmail =
                "concurrent-first-" +
                        testId +
                        "@rowzero.test";

        String secondEmail =
                "concurrent-second-" +
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

        CountDownLatch ready =
                new CountDownLatch(2);

        CountDownLatch start =
                new CountDownLatch(1);

        ExecutorService executor =
                Executors.newFixedThreadPool(2);

        try {
            Future<Integer> firstResult =
                    executor.submit(
                            () ->
                                    reserve(
                                            firstToken,
                                            fixture.screeningSeatId(),
                                            ready,
                                            start
                                    )
                    );

            Future<Integer> secondResult =
                    executor.submit(
                            () ->
                                    reserve(
                                            secondToken,
                                            fixture.screeningSeatId(),
                                            ready,
                                            start
                                    )
                    );

            assertTrue(
                    ready.await(
                            5,
                            TimeUnit.SECONDS
                    )
            );

            start.countDown();

            List<Integer> statuses =
                    new ArrayList<>();

            statuses.add(
                    firstResult.get(
                            10,
                            TimeUnit.SECONDS
                    )
            );

            statuses.add(
                    secondResult.get(
                            10,
                            TimeUnit.SECONDS
                    )
            );

            Collections.sort(
                    statuses
            );

            assertEquals(
                    List.of(
                            201,
                            409
                    ),
                    statuses
            );

            Long activeReservations =
                    jdbcTemplate.queryForObject(
                            """
                            SELECT COUNT(*)
                            FROM reservations
                            WHERE screening_seat_id = ?
                              AND status IN ('HELD', 'CONFIRMED')
                            """,
                            Long.class,
                            fixture.screeningSeatId()
                    );

            assertEquals(
                    1L,
                    activeReservations
            );
        } finally {
            executor.shutdownNow();
        }
    }

    private int reserve(
            String token,
            Long screeningSeatId,
            CountDownLatch ready,
            CountDownLatch start
    ) throws Exception {

        ready.countDown();

        assertTrue(
                start.await(
                        5,
                        TimeUnit.SECONDS
                )
        );

        return mockMvc.perform(
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
                .andReturn()
                .getResponse()
                .getStatus();
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
                        "Concurrency Test Movie " + testId,
                        "Concurrency Test Movie " + testId,
                        "Movie created for concurrency test",
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
                        "Concurrency Hall " + testId
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
                ).plusDays(3);

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