package com.rowzero.backend.user;

import com.rowzero.backend.reservation.Reservation;
import com.rowzero.backend.reservation.ReservationRepository;
import com.rowzero.backend.reservation.ReservationStatus;
import com.rowzero.backend.user.dto.AdminUserPageResponse;
import com.rowzero.backend.user.dto.AdminUserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    public AdminUserService(
            UserRepository userRepository,
            ReservationRepository reservationRepository
    ) {
        this.userRepository = userRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public AdminUserPageResponse getUsers(
            String search,
            Boolean enabled,
            int page,
            int size
    ) {
        String normalizedSearch =
                search == null || search.isBlank()
                        ? null
                        : search.trim();

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<User> users;

        if (normalizedSearch != null && enabled != null) {
            users = userRepository
                    .findByEmailContainingIgnoreCaseAndEnabled(
                            normalizedSearch,
                            enabled,
                            pageable
                    );

        } else if (normalizedSearch != null) {
            users = userRepository
                    .findByEmailContainingIgnoreCase(
                            normalizedSearch,
                            pageable
                    );

        } else if (enabled != null) {
            users = userRepository
                    .findByEnabled(
                            enabled,
                            pageable
                    );

        } else {
            users = userRepository.findAll(pageable);
        }

        Page<AdminUserResponse> result =
                users.map(AdminUserResponse::from);

        return AdminUserPageResponse.from(result);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        return AdminUserResponse.from(user);
    }

    @Transactional
    public AdminUserResponse updateEnabled(
            Long id,
            boolean enabled
    ) {
        User user = userRepository
                .findByIdForUpdate(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );

        if (user.getRole() != UserRole.USER) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only USER accounts can be enabled or disabled"
            );
        }

        if (!enabled) {
            cancelFutureActiveReservations(user);
        }

        user.setEnabled(enabled);

        return AdminUserResponse.from(user);
    }

    private void cancelFutureActiveReservations(User user) {

        OffsetDateTime now =
                OffsetDateTime.now(ZoneOffset.UTC);

        List<ReservationStatus> activeStatuses = List.of(
                ReservationStatus.HELD,
                ReservationStatus.CONFIRMED
        );

        List<Reservation> reservations =
                reservationRepository
                        .findActiveFutureReservations(
                                user.getId(),
                                activeStatuses,
                                now
                        );

        for (Reservation reservation : reservations) {
            reservation.setStatus(
                    ReservationStatus.CANCELLED
            );

            reservation.setCancelledAt(now);
        }
    }
}