import {
    useEffect,
    useRef,
    useState,
} from 'react'
import { Link } from 'react-router-dom'
import type { Reservation } from '../reservations/reservationTypes'
import {
    formatCountdown,
    getRemainingSeconds,
} from '../utils/countdown'
import {
    formatLongDate,
    formatScreeningTime,
} from '../utils/dateTime'

type Props = {
    reservation: Reservation
    onExpired: () => void
}

export function ReservationCard({
                                    reservation,
                                    onExpired,
                                }: Props) {
    const [
        remainingSeconds,
        setRemainingSeconds,
    ] = useState(0)

    const expiredHandled =
        useRef(false)

    useEffect(() => {
        if (
            reservation.status !==
            'HELD' ||
            !reservation.expiresAt
        ) {
            setRemainingSeconds(0)
            return
        }

        const expiresAt =
            reservation.expiresAt

        function update() {
            const remaining =
                getRemainingSeconds(
                    expiresAt,
                )

            setRemainingSeconds(
                remaining,
            )

            if (
                remaining === 0 &&
                !expiredHandled.current
            ) {
                expiredHandled.current =
                    true

                onExpired()
            }
        }

        update()

        const interval =
            window.setInterval(
                update,
                1000,
            )

        return () => {
            window.clearInterval(
                interval,
            )
        }
    }, [
        reservation,
        onExpired,
    ])

    return (
        <article className="user-reservation-card">
            <div className="user-reservation-card__main">
                <div className="user-reservation-card__top">
                    <h3>
                        {reservation.movieTitle}
                    </h3>

                    <span
                        className={`user-reservation-status user-reservation-status--${reservation.status.toLowerCase()}`}
                    >
            {reservation.status}
          </span>
                </div>

                <div className="user-reservation-card__meta">
          <span>
            {formatLongDate(
                reservation.screeningStartAt,
            )}
          </span>

                    <span>
            {formatScreeningTime(
                reservation.screeningStartAt,
                reservation.screeningEndAt,
            )}
          </span>

                    <span>
            {reservation.hallName}
          </span>

                    <span>
            Seat{' '}
                        {reservation.rowLabel}
                        {reservation.seatNumber}
          </span>
                </div>

                {reservation.status ===
                    'HELD' &&
                    reservation.expiresAt && (
                        <div className="user-reservation-card__hold">
              <span>
                Time remaining
              </span>

                            <strong>
                                {formatCountdown(
                                    remainingSeconds,
                                )}
                            </strong>
                        </div>
                    )}
            </div>

            <Link
                to={`/reservations/${reservation.id}`}
                className={
                    reservation.status ===
                    'HELD'
                        ? 'button button--primary'
                        : 'button button--secondary'
                }
            >
                {reservation.status ===
                'HELD'
                    ? 'Continue'
                    : 'View details'}
            </Link>
        </article>
    )
}