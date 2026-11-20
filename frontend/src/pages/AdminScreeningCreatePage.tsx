import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useNavigate,
} from 'react-router-dom'
import { getAdminHalls } from '../admin/adminHallApi'
import type {
    AdminHall,
} from '../admin/adminHallTypes'
import { getAdminMovies } from '../admin/adminMovieApi'
import type {
    AdminMovie,
} from '../admin/adminMovieTypes'
import { createAdminScreening } from '../admin/adminScreeningApi'
import { isApiError } from '../api/apiError'
import '../styles/admin.css'

function toOffsetDateTime(
    value: string,
) {
    return new Date(
        value,
    ).toISOString()
}

export function AdminScreeningCreatePage() {
    const navigate = useNavigate()

    const [
        movies,
        setMovies,
    ] = useState<AdminMovie[]>([])

    const [
        halls,
        setHalls,
    ] = useState<AdminHall[]>([])

    const [
        movieId,
        setMovieId,
    ] = useState('')

    const [
        hallId,
        setHallId,
    ] = useState('')

    const [
        startAt,
        setStartAt,
    ] = useState('')

    const [
        endAt,
        setEndAt,
    ] = useState('')

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        saving,
        setSaving,
    ] = useState(false)

    const [
        error,
        setError,
    ] =
        useState<string | null>(null)

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadOptions() {
            setLoading(true)
            setError(null)

            try {
                const [
                    moviesResponse,
                    hallsResponse,
                ] = await Promise.all([
                    getAdminMovies(
                        {
                            visible: true,
                            page: 0,
                            size: 100,
                        },
                        controller.signal,
                    ),
                    getAdminHalls(
                        controller.signal,
                    ),
                ])

                setMovies(
                    moviesResponse.content,
                )

                setHalls(
                    hallsResponse,
                )
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return
                }

                if (isApiError(error)) {
                    setError(error.message)
                } else {
                    setError(
                        'Unable to load form data.',
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

        void loadOptions()

        return () => {
            controller.abort()
        }
    }, [])

    const selectedMovie =
        movies.find(
            (movie) =>
                movie.id ===
                Number(movieId),
        )

    function handleMovieChange(
        value: string,
    ) {
        setMovieId(value)

        const movie =
            movies.find(
                (item) =>
                    item.id ===
                    Number(value),
            )

        if (
            movie?.runtime &&
            startAt
        ) {
            const start =
                new Date(startAt)

            start.setMinutes(
                start.getMinutes() +
                movie.runtime,
            )

            const year =
                start.getFullYear()

            const month =
                String(
                    start.getMonth() + 1,
                ).padStart(2, '0')

            const day =
                String(
                    start.getDate(),
                ).padStart(2, '0')

            const hours =
                String(
                    start.getHours(),
                ).padStart(2, '0')

            const minutes =
                String(
                    start.getMinutes(),
                ).padStart(2, '0')

            setEndAt(
                `${year}-${month}-${day}T${hours}:${minutes}`,
            )
        }
    }

    function handleStartChange(
        value: string,
    ) {
        setStartAt(value)

        if (
            selectedMovie?.runtime &&
            value
        ) {
            const start =
                new Date(value)

            start.setMinutes(
                start.getMinutes() +
                selectedMovie.runtime,
            )

            const year =
                start.getFullYear()

            const month =
                String(
                    start.getMonth() + 1,
                ).padStart(2, '0')

            const day =
                String(
                    start.getDate(),
                ).padStart(2, '0')

            const hours =
                String(
                    start.getHours(),
                ).padStart(2, '0')

            const minutes =
                String(
                    start.getMinutes(),
                ).padStart(2, '0')

            setEndAt(
                `${year}-${month}-${day}T${hours}:${minutes}`,
            )
        }
    }

    async function handleSubmit(
        event: FormEvent,
    ) {
        event.preventDefault()

        if (
            !movieId ||
            !hallId ||
            !startAt ||
            !endAt
        ) {
            return
        }

        setSaving(true)
        setError(null)

        try {
            const screening =
                await createAdminScreening(
                    {
                        movieId:
                            Number(movieId),
                        hallId:
                            Number(hallId),
                        startAt:
                            toOffsetDateTime(
                                startAt,
                            ),
                        endAt:
                            toOffsetDateTime(
                                endAt,
                            ),
                    },
                )

            navigate(
                `/admin/screenings/${screening.id}`,
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to create screening.',
                )
            }
        } finally {
            setSaving(false)
        }
    }

    return (
        <section className="admin-page">
            <Link
                to="/admin/screenings"
                className="back-link"
            >
                ← Back to screenings
            </Link>

            <div className="admin-page-heading admin-page-heading--details">
                <div>
                    <p className="eyebrow">
                        Programme
                    </p>

                    <h1>
                        Add screening
                    </h1>

                    <p>
                        Select a movie, hall and
                        screening time.
                    </p>
                </div>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="skeleton admin-details-skeleton" />
            ) : (
                <form
                    className="admin-screening-form"
                    onSubmit={handleSubmit}
                >
                    <label>
                        <span>Movie</span>

                        <select
                            value={movieId}
                            onChange={(event) =>
                                handleMovieChange(
                                    event.target.value,
                                )
                            }
                            required
                        >
                            <option value="">
                                Select movie
                            </option>

                            {movies.map(
                                (movie) => (
                                    <option
                                        key={movie.id}
                                        value={movie.id}
                                    >
                                        {movie.title}
                                        {movie.runtime
                                            ? ` (${movie.runtime} min)`
                                            : ''}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>

                    <label>
                        <span>Hall</span>

                        <select
                            value={hallId}
                            onChange={(event) =>
                                setHallId(
                                    event.target.value,
                                )
                            }
                            required
                        >
                            <option value="">
                                Select hall
                            </option>

                            {halls.map(
                                (hall) => (
                                    <option
                                        key={hall.id}
                                        value={hall.id}
                                    >
                                        {hall.name}
                                    </option>
                                ),
                            )}
                        </select>
                    </label>

                    <label>
                        <span>Start</span>

                        <input
                            type="datetime-local"
                            value={startAt}
                            onChange={(event) =>
                                handleStartChange(
                                    event.target.value,
                                )
                            }
                            required
                        />
                    </label>

                    <label>
                        <span>End</span>

                        <input
                            type="datetime-local"
                            value={endAt}
                            onChange={(event) =>
                                setEndAt(
                                    event.target.value,
                                )
                            }
                            required
                        />
                    </label>

                    {selectedMovie?.runtime && (
                        <div className="admin-screening-runtime">
                            Minimum duration for{' '}
                            <strong>
                                {
                                    selectedMovie.title
                                }
                            </strong>
                            :{' '}
                            {
                                selectedMovie.runtime
                            }{' '}
                            minutes.
                        </div>
                    )}

                    <div className="admin-screening-form__actions">
                        <Link
                            to="/admin/screenings"
                            className="button button--secondary"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            className="button button--primary"
                            disabled={saving}
                        >
                            {saving
                                ? 'Creating...'
                                : 'Create screening'}
                        </button>
                    </div>
                </form>
            )}
        </section>
    )
}