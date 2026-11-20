import { Link } from 'react-router-dom'
import type { Screening } from '../screenings/screeningTypes'
import {
    formatDate,
    formatScreeningTime,
} from '../utils/dateTime'

type Props = {
    screening: Screening
    showMovieTitle?: boolean
}

export function ScreeningCard({
                                  screening,
                                  showMovieTitle = false,
                              }: Props) {
    return (
        <article
            className={
                showMovieTitle
                    ? 'screening-card screening-card--with-movie'
                    : 'screening-card'
            }
        >
            {showMovieTitle && (
                <div className="screening-card__movie">
                    <span>Film</span>

                    <strong>
                        {screening.movieTitle}
                    </strong>
                </div>
            )}

            <div className="screening-card__date">
        <span>
          {formatDate(
              screening.startAt,
          )}
        </span>

                <strong>
                    {formatScreeningTime(
                        screening.startAt,
                        screening.endAt,
                    )}
                </strong>
            </div>

            <div className="screening-card__hall">
                <span>Hall</span>

                <strong>
                    {screening.hallName}
                </strong>
            </div>

            <Link
                to={`/screenings/${screening.id}`}
                className="button button--primary"
            >
                View seats
            </Link>
        </article>
    )
}