import { Link } from 'react-router-dom'
import { getMoviePosterUrl } from '../movies/movieImage'
import type { Movie } from '../movies/movieTypes'

type Props = {
    movie: Movie
}

export function MovieCard({
                              movie,
                          }: Props) {
    const posterUrl =
        getMoviePosterUrl(movie.posterPath)

    const releaseYear =
        movie.releaseDate?.slice(0, 4)

    const meta = [
        releaseYear,
        movie.runtime
            ? `${movie.runtime} min`
            : null,
    ].filter(Boolean)

    return (
        <article className="movie-card">
            <Link
                to={`/movies/${movie.id}`}
                className="movie-card__poster-link"
                aria-label={`View ${movie.title}`}
            >
                <div className="movie-card__poster">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={`${movie.title} poster`}
                            loading="lazy"
                        />
                    ) : (
                        <div className="movie-card__poster-placeholder">
              <span>
                {movie.title
                    .charAt(0)
                    .toUpperCase()}
              </span>
                        </div>
                    )}
                </div>
            </Link>

            <div className="movie-card__body">
                {meta.length > 0 && (
                    <p className="movie-card__meta">
                        {meta.join(' · ')}
                    </p>
                )}

                <h2>
                    <Link
                        to={`/movies/${movie.id}`}
                    >
                        {movie.title}
                    </Link>
                </h2>

                <p className="movie-card__overview">
                    {movie.overview ||
                        'View film details and upcoming screenings.'}
                </p>

                <Link
                    to={`/movies/${movie.id}`}
                    className="movie-card__action"
                >
                    View details
                    <span aria-hidden="true">
            →
          </span>
                </Link>
            </div>
        </article>
    )
}