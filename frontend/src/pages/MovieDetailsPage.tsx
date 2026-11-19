import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    Link,
    useParams,
} from 'react-router-dom'
import { isApiError } from '../api/apiError'
import { ScreeningCard } from '../components/ScreeningCard'
import { getMovie } from '../movies/movieApi'
import {
    getMovieBackdropUrl,
    getMoviePosterUrl,
} from '../movies/movieImage'
import type { Movie } from '../movies/movieTypes'
import { getScreenings } from '../screenings/screeningApi'
import type { Screening } from '../screenings/screeningTypes'
import '../styles/movieDetails.css'

function parseMovieId(
    value: string | undefined,
) {
    if (!value) {
        return null
    }

    const parsed = Number.parseInt(
        value,
        10,
    )

    if (
        Number.isNaN(parsed) ||
        parsed <= 0
    ) {
        return null
    }

    return parsed
}

export function MovieDetailsPage() {
    const { id } = useParams()

    const movieId = parseMovieId(id)

    const [
        movie,
        setMovie,
    ] = useState<Movie | null>(null)

    const [
        screenings,
        setScreenings,
    ] = useState<Screening[]>([])

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState<string | null>(null)

    const [
        notFound,
        setNotFound,
    ] = useState(false)

    const [
        reloadKey,
        setReloadKey,
    ] = useState(0)

    useEffect(() => {
        if (movieId === null) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const currentMovieId = movieId

        const controller =
            new AbortController()

        async function loadPage() {
            setLoading(true)
            setError(null)
            setNotFound(false)

            try {
                const [
                    movieResponse,
                    screeningsResponse,
                ] = await Promise.all([
                    getMovie(
                        currentMovieId,
                        controller.signal,
                    ),
                    getScreenings({
                        movieId: currentMovieId,
                        page: 0,
                        size: 50,
                        signal:
                        controller.signal,
                    }),
                ])

                setMovie(movieResponse)

                setScreenings(
                    screeningsResponse.content,
                )
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return
                }

                if (
                    isApiError(error) &&
                    error.status === 404
                ) {
                    setNotFound(true)
                    return
                }

                if (isApiError(error)) {
                    setError(error.message)
                } else {
                    setError(
                        'Unable to load movie details.',
                    )
                }
            } finally {
                if (
                    !controller.signal.aborted
                ) {
                    setLoading(false)
                }
            }
        }

        void loadPage()

        return () => {
            controller.abort()
        }
    }, [
        movieId,
        reloadKey,
    ])

    const sortedScreenings =
        useMemo(
            () =>
                [...screenings].sort(
                    (first, second) =>
                        new Date(
                            first.startAt,
                        ).getTime() -
                        new Date(
                            second.startAt,
                        ).getTime(),
                ),
            [screenings],
        )

    if (loading) {
        return (
            <section className="movie-details-page">
                <div className="movie-details-loading">
                    <div className="movie-details-loading__backdrop skeleton" />

                    <div className="movie-details-loading__body">
                        <div className="movie-details-loading__poster skeleton" />

                        <div className="movie-details-loading__copy">
                            <div className="skeleton skeleton--small" />
                            <div className="skeleton movie-details-loading__title" />
                            <div className="skeleton skeleton--text" />
                            <div className="skeleton skeleton--text" />
                            <div className="skeleton skeleton--text skeleton--short" />
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (notFound) {
        return (
            <section className="page">
                <div className="content-state">
                    <div className="content-state__icon">
                        404
                    </div>

                    <h2>Movie not found</h2>

                    <p>
                        This film does not exist
                        or is not available in the
                        public programme.
                    </p>

                    <Link
                        to="/"
                        className="button button--primary"
                    >
                        Back to movies
                    </Link>
                </div>
            </section>
        )
    }

    if (error || !movie) {
        return (
            <section className="page">
                <div className="content-state">
                    <div className="content-state__icon">
                        !
                    </div>

                    <h2>
                        We couldn't load this film
                    </h2>

                    <p>
                        {error ??
                            'Unable to load movie details.'}
                    </p>

                    <button
                        type="button"
                        className="button button--primary"
                        onClick={() =>
                            setReloadKey(
                                (current) =>
                                    current + 1,
                            )
                        }
                    >
                        Try again
                    </button>
                </div>
            </section>
        )
    }

    const posterUrl =
        getMoviePosterUrl(
            movie.posterPath,
        )

    const backdropUrl =
        getMovieBackdropUrl(
            movie.backdropPath,
        )

    const releaseYear =
        movie.releaseDate?.slice(0, 4)

    const metadata = [
        releaseYear,
        movie.runtime
            ? `${movie.runtime} min`
            : null,
    ].filter(Boolean)

    return (
        <section className="movie-details-page">
            <div className="movie-details-hero">
                {backdropUrl && (
                    <img
                        className="movie-details-hero__backdrop"
                        src={backdropUrl}
                        alt=""
                    />
                )}

                <div className="movie-details-hero__overlay" />

                <div className="movie-details-hero__content">
                    <Link
                        to="/"
                        className="movie-details-back"
                    >
                        ← Back to movies
                    </Link>

                    <div className="movie-details-layout">
                        <div className="movie-details-poster">
                            {posterUrl ? (
                                <img
                                    src={posterUrl}
                                    alt={`${movie.title} poster`}
                                />
                            ) : (
                                <div className="movie-details-poster__placeholder">
                                    {movie.title
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="movie-details-copy">
                            <p className="eyebrow">
                                Film
                            </p>

                            <h1>
                                {movie.title}
                            </h1>

                            {movie.originalTitle &&
                                movie.originalTitle !==
                                movie.title && (
                                    <p className="movie-details-original-title">
                                        {
                                            movie.originalTitle
                                        }
                                    </p>
                                )}

                            {metadata.length > 0 && (
                                <div className="movie-details-meta">
                                    {metadata.map(
                                        (item) => (
                                            <span key={item}>
                        {item}
                      </span>
                                        ),
                                    )}
                                </div>
                            )}

                            <p className="movie-details-overview">
                                {movie.overview ||
                                    'No overview is available for this film.'}
                            </p>

                            <a
                                href="#screenings"
                                className="button button--primary movie-details-cta"
                            >
                                View screenings
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div
                id="screenings"
                className="movie-screenings"
            >
                <div className="movie-screenings__heading">
                    <div>
                        <p className="eyebrow">
                            Festival programme
                        </p>

                        <h2>
                            Upcoming screenings
                        </h2>
                    </div>

                    <Link
                        to="/schedule"
                        className="movie-screenings__schedule-link"
                    >
                        Full schedule →
                    </Link>
                </div>

                {sortedScreenings.length >
                0 ? (
                    <div className="screening-list">
                        {sortedScreenings.map(
                            (screening) => (
                                <ScreeningCard
                                    key={screening.id}
                                    screening={
                                        screening
                                    }
                                />
                            ),
                        )}
                    </div>
                ) : (
                    <div className="movie-screenings-empty">
                        <h3>
                            No upcoming screenings
                        </h3>

                        <p>
                            There are currently no
                            screenings scheduled for
                            this film.
                        </p>

                        <Link
                            to="/schedule"
                            className="button button--secondary"
                        >
                            Browse schedule
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}