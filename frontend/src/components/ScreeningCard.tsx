import { Link } from 'react-router-dom'
import type {
    Screening,
} from '../screenings/screeningTypes'
import {
    formatDate,
    formatScreeningTime,
} from '../utils/dateTime'
import '../styles/screeningCard.css'

type Props = {
    screening: Screening
    showMovieTitle?: boolean
}

function getPosterUrl(
    posterPath: string | null,
) {
    if (!posterPath) {
        return null
    }

    return `https://image.tmdb.org/t/p/w342${posterPath}`
}

export function ScreeningCard({
                                  screening,
                                  showMovieTitle = false,
                              }: Props) {
    const posterUrl =
        getPosterUrl(
            screening.posterPath,
        )

    return (
        <article
            className={`screening-card ${
                showMovieTitle
                    ? 'screening-card--with-movie'
                    : 'screening-card--simple'
            }`}
        >
            {showMovieTitle && (
                <div className="screening-card__poster">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={`${screening.movieTitle} poster`}
                            loading="lazy"
                        />
                    ) : (
                        <div className="screening-card__poster-placeholder">
                            No poster
                        </div>
                    )}
                </div>
            )}

            <div className="screening-card__content">
                {showMovieTitle && (
                    <div className="screening-card__movie">
            <span>
              Film
            </span>

                        <strong>
                            {screening.movieTitle}
                        </strong>
                    </div>
                )}

                <div className="screening-card__metadata">
                    <div>
            <span>
              Date & time
            </span>

                        <strong>
                            {formatDate(
                                screening.startAt,
                            )}
                        </strong>

                        <small>
                            {formatScreeningTime(
                                screening.startAt,
                                screening.endAt,
                            )}
                        </small>
                    </div>

                    <div>
            <span>
              Hall
            </span>

                        <strong>
                            {screening.hallName}
                        </strong>
                    </div>
                </div>
            </div>

            <Link
                to={`/screenings/${screening.id}`}
                className="button button--primary screening-card__action"
            >
                View seats
            </Link>
        </article>
    )
}