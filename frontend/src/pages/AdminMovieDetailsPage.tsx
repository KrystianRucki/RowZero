import {
    useEffect,
    useState,
} from 'react'
import {
    Link,
    useNavigate,
    useParams,
} from 'react-router-dom'
import {
    deleteAdminMovie,
    getAdminMovie,
    refreshAdminMovie,
    updateAdminMovieVisibility,
} from '../admin/adminMovieApi'
import type { AdminMovie } from '../admin/adminMovieTypes'
import { isApiError } from '../api/apiError'
import { formatDateTime } from '../utils/dateTime'
import {
    getTmdbBackdropUrl,
    getTmdbPosterUrl,
} from '../utils/tmdbImage'
import '../styles/admin.css'

function parseMovieId(
    value: string | undefined,
) {
    if (!value) {
        return null
    }

    const parsed =
        Number.parseInt(value, 10)

    if (
        Number.isNaN(parsed) ||
        parsed <= 0
    ) {
        return null
    }

    return parsed
}

export function AdminMovieDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const movieId =
        parseMovieId(id)

    const [
        movie,
        setMovie,
    ] =
        useState<AdminMovie | null>(
            null,
        )

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] =
        useState<string | null>(null)

    const [
        notFound,
        setNotFound,
    ] = useState(false)

    const [
        action,
        setAction,
    ] =
        useState<
            | 'visibility'
            | 'refresh'
            | 'delete'
            | null
        >(null)

    const [
        deleteDialog,
        setDeleteDialog,
    ] = useState(false)

    useEffect(() => {
        if (movieId === null) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const currentMovieId =
            movieId

        const controller =
            new AbortController()

        async function loadMovie() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getAdminMovie(
                        currentMovieId,
                        controller.signal,
                    )

                setMovie(response)
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
                        'Unable to load movie.',
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

        void loadMovie()

        return () => {
            controller.abort()
        }
    }, [movieId])

    async function toggleVisibility() {
        if (!movie) {
            return
        }

        const currentMovie = movie

        setAction('visibility')
        setError(null)

        try {
            const response =
                await updateAdminMovieVisibility(
                    currentMovie,
                    !currentMovie.visible,
                )

            setMovie(response)
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to update movie visibility.',
                )
            }
        } finally {
            setAction(null)
        }
    }

    async function handleRefresh() {
        if (!movie) {
            return
        }

        const currentMovie = movie

        setAction('refresh')
        setError(null)

        try {
            const response =
                await refreshAdminMovie(
                    currentMovie.id,
                )

            setMovie(response)
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to refresh movie from TMDB.',
                )
            }
        } finally {
            setAction(null)
        }
    }

    async function handleDelete() {
        if (!movie) {
            return
        }

        const currentMovie = movie

        setAction('delete')
        setError(null)

        try {
            await deleteAdminMovie(
                currentMovie.id,
            )

            navigate('/admin/movies')
        } catch (error) {
            setDeleteDialog(false)

            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to delete movie.',
                )
            }
        } finally {
            setAction(null)
        }
    }

    if (loading) {
        return (
            <section className="admin-page">
                <div className="skeleton admin-details-skeleton" />
            </section>
        )
    }

    if (
        notFound ||
        !movie
    ) {
        return (
            <section className="admin-page">
                <div className="content-state">
                    <div className="content-state__icon">
                        404
                    </div>

                    <h2>
                        Movie not found
                    </h2>

                    <Link
                        to="/admin/movies"
                        className="button button--primary"
                    >
                        Back to movies
                    </Link>
                </div>
            </section>
        )
    }

    const posterUrl =
        getTmdbPosterUrl(
            movie.posterPath,
            'w342',
        )

    const backdropUrl =
        getTmdbBackdropUrl(
            movie.backdropPath,
        )

    return (
        <section className="admin-page">
            <Link
                to="/admin/movies"
                className="back-link"
            >
                ← Back to movies
            </Link>

            <div className="admin-movie-details-hero">
                {backdropUrl && (
                    <img
                        className="admin-movie-details-hero__backdrop"
                        src={backdropUrl}
                        alt=""
                    />
                )}

                <div className="admin-movie-details-hero__overlay" />

                <div className="admin-movie-details-hero__content">
                    <div className="admin-movie-details-poster">
                        {posterUrl ? (
                            <img
                                src={posterUrl}
                                alt=""
                            />
                        ) : (
                            <span>
                No poster
              </span>
                        )}
                    </div>

                    <div>
                        <p className="eyebrow">
                            Movie #{movie.id}
                        </p>

                        <h1>
                            {movie.title}
                        </h1>

                        {movie.originalTitle &&
                            movie.originalTitle !==
                            movie.title && (
                                <p className="admin-movie-original-title">
                                    {
                                        movie.originalTitle
                                    }
                                </p>
                            )}

                        <div className="admin-movie-details-meta">
              <span>
                TMDB #{movie.tmdbId}
              </span>

                            <span>
                {movie.runtime
                    ? `${movie.runtime} min`
                    : 'Runtime unknown'}
              </span>

                            <span>
                {movie.releaseDate ??
                    'Release date unknown'}
              </span>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            <div className="admin-movie-details-grid">
                <div className="admin-details-card">
                    <div className="admin-details-row">
            <span>
              Visibility
            </span>

                        <strong>
                            {movie.visible
                                ? 'Visible'
                                : 'Hidden'}
                        </strong>
                    </div>

                    <div className="admin-details-row">
            <span>
              Last synchronized
            </span>

                        <strong>
                            {movie.lastSyncedAt
                                ? formatDateTime(
                                    movie.lastSyncedAt,
                                )
                                : 'Never'}
                        </strong>
                    </div>

                    <div className="admin-details-row">
            <span>
              TMDB ID
            </span>

                        <strong>
                            {movie.tmdbId}
                        </strong>
                    </div>
                </div>

                <div className="admin-movie-overview">
                    <p className="eyebrow">
                        Overview
                    </p>

                    <p>
                        {movie.overview ||
                            'No overview available.'}
                    </p>
                </div>
            </div>

            <div className="admin-movie-actions">
                <button
                    type="button"
                    className="button button--secondary"
                    disabled={action !== null}
                    onClick={() =>
                        void toggleVisibility()
                    }
                >
                    {action === 'visibility'
                        ? 'Saving...'
                        : movie.visible
                            ? 'Hide from catalogue'
                            : 'Show in catalogue'}
                </button>

                <button
                    type="button"
                    className="button button--primary"
                    disabled={action !== null}
                    onClick={() =>
                        void handleRefresh()
                    }
                >
                    {action === 'refresh'
                        ? 'Refreshing...'
                        : 'Refresh from TMDB'}
                </button>
            </div>

            <div className="admin-danger-zone">
                <div>
                    <p className="eyebrow">
                        Delete movie
                    </p>

                    <h2>
                        Remove local movie
                    </h2>

                    <p>
                        A movie can only be
                        deleted if it has never
                        been referenced by a
                        screening. Movies with
                        screening history should
                        be hidden instead.
                    </p>
                </div>

                <button
                    type="button"
                    className="button button--danger"
                    disabled={action !== null}
                    onClick={() =>
                        setDeleteDialog(true)
                    }
                >
                    Delete movie
                </button>
            </div>

            {deleteDialog && (
                <div
                    className="admin-dialog-backdrop"
                    onMouseDown={() =>
                        setDeleteDialog(false)
                    }
                >
                    <div
                        className="admin-dialog"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <p className="eyebrow">
                            Delete movie
                        </p>

                        <h2>
                            Delete {movie.title}?
                        </h2>

                        <p>
                            This removes the local
                            movie record. If the
                            movie has ever been
                            assigned to a screening,
                            the backend will reject
                            this operation.
                        </p>

                        <div className="admin-dialog__actions">
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() =>
                                    setDeleteDialog(
                                        false,
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button--danger"
                                disabled={
                                    action === 'delete'
                                }
                                onClick={() =>
                                    void handleDelete()
                                }
                            >
                                {action === 'delete'
                                    ? 'Deleting...'
                                    : 'Delete movie'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}