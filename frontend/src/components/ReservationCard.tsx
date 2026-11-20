import { Link } from 'react-router-dom'
import type {
    Reservation,
} from '../reservations/reservationTypes'
import {
    formatLongDate,
    formatScreeningTime,
} from '../utils/dateTime'
import '../styles/reservationCard.css'

type Props = {
    reservation: Reservation
}

function getPosterUrl(
    posterPath: string | null,
) {
    if (!posterPath) {
        return null
    }

    return `https://image.tmdb.org/t/p/w342${posterPath}`
}

export function ReservationCard({
                                    reservation,
                                }: Props) {
    const posterUrl =
        getPosterUrl(
            reservation.posterPath,
        )

    return (
        <article className="my-reservation-card">
            <div className="my-reservation-card__poster">
                {posterUrl ? (
                    <img
                        src={posterUrl}
                        alt={`${reservation.movieTitle} poster`}
                        loading="lazy"
                    />
                ) : (
                    <div className="my-reservation-card__poster-placeholder">
                        No poster
                    </div>
                )}
            </div>

            <div className="my-reservation-card__content">
                <div className="my-reservation-card__heading">
                    <div>
                        <h3>
                            {reservation.movieTitle}
                        </h3>

                        <span>
              Reservation #
                            {reservation.id}
            </span>
                    </div>

                    <span
                        className={`my-reservation-card__status my-reservation-card__status--${reservation.status.toLowerCase()}`}
                    >
            {reservation.status}
          </span>
                </div>

                <div className="my-reservation-card__metadata">
                    <div>
            <span>
              Date
            </span>

                        <strong>
                            {formatLongDate(
                                reservation.screeningStartAt,
                            )}
                        </strong>
                    </div>

                    <div>
            <span>
              Time
            </span>

                        <strong>
                            {formatScreeningTime(
                                reservation.screeningStartAt,
                                reservation.screeningEndAt,
                            )}
                        </strong>
                    </div>

                    <div>
            <span>
              Hall
            </span>

                        <strong>
                            {reservation.hallName}
                        </strong>
                    </div>

                    <div>
            <span>
              Seat
            </span>

                        <strong>
                            {reservation.rowLabel}
                            {reservation.seatNumber}
                        </strong>
                    </div>
                </div>
            </div>

            <Link
                to={`/reservations/${reservation.id}`}
                className="button button--secondary my-reservation-card__action"
            >
                View details
            </Link>
        </article>
    )
}