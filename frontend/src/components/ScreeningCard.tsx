import { Link } from 'react-router-dom'
import type { Screening } from '../screenings/screeningTypes'
import {
    formatDate,
    formatScreeningTime,
} from '../utils/dateTime'

type Props = {
    screening: Screening
}

export function ScreeningCard({
                                  screening,
                              }: Props) {
    const hall =
        screening.hallName ??
        (screening.hallId
            ? `Hall ${screening.hallId}`
            : 'Festival hall')

    return (
        <article className="screening-card">
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
                <strong>{hall}</strong>
            </div>

            <Link
                to={`/screenings/${screening.id}`}
                className="button button--primary"
            >
                Choose seats
            </Link>
        </article>
    )
}