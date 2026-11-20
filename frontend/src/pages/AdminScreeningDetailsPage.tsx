import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useParams,
} from 'react-router-dom'
import { getAdminMovies } from '../admin/adminMovieApi'
import type {
    AdminMovie,
} from '../admin/adminMovieTypes'
import {
    cancelAdminScreening,
    getAdminScreening,
    getAdminScreeningSeats,
    updateAdminScreening,
} from '../admin/adminScreeningApi'
import type {
    AdminScreening,
    AdminScreeningSeat,
} from '../admin/adminScreeningTypes'
import { isApiError } from '../api/apiError'
import { formatDateTime } from '../utils/dateTime'
import '../styles/admin.css'

function parseScreeningId(
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

function toInputValue(
    value: string,
) {
    const date =
        new Date(value)

    const year =
        date.getFullYear()

    const month =
        String(
            date.getMonth() + 1,
        ).padStart(2, '0')

    const day =
        String(
            date.getDate(),
        ).padStart(2, '0')

    const hours =
        String(
            date.getHours(),
        ).padStart(2, '0')

    const minutes =
        String(
            date.getMinutes(),
        ).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
}

function toOffsetDateTime(
    value: string,
) {
    return new Date(
        value,
    ).toISOString()
}

export function AdminScreeningDetailsPage() {
    const { id } = useParams()

    const screeningId =
        parseScreeningId(id)

    const [
        screening,
        setScreening,
    ] =
        useState<AdminScreening | null>(
            null,
        )

    const [
        seats,
        setSeats,
    ] =
        useState<
            AdminScreeningSeat[]
        >([])

    const [
        movies,
        setMovies,
    ] = useState<AdminMovie[]>([])

    const [
        movieId,
        setMovieId,
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
        cancelling,
        setCancelling,
    ] = useState(false)

    const [
        cancelDialog,
        setCancelDialog,
    ] = useState(false)

    const [
        notFound,
        setNotFound,
    ] = useState(false)

    const [
        error,
        setError,
    ] =
        useState<string | null>(null)

    const [
        reloadKey,
        setReloadKey,
    ] = useState(0)

    useEffect(() => {
        if (screeningId === null) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const currentId =
            screeningId

        const controller =
            new AbortController()

        async function loadPage() {
            setLoading(true)
            setError(null)
            setNotFound(false)

            try {
                const [
                    screeningResponse,
                    seatsResponse,
                    moviesResponse,
                ] = await Promise.all([
                    getAdminScreening(
                        currentId,
                        controller.signal,
                    ),
                    getAdminScreeningSeats(
                        currentId,
                        controller.signal,
                    ),
                    getAdminMovies(
                        {
                            page: 0,
                            size: 100,
                        },
                        controller.signal,
                    ),
                ])

                setScreening(
                    screeningResponse,
                )

                setSeats(
                    seatsResponse,
                )

                setMovies(
                    moviesResponse.content,
                )

                setMovieId(
                    String(
                        screeningResponse.movieId,
                    ),
                )

                setStartAt(
                    toInputValue(
                        screeningResponse.startAt,
                    ),
                )

                setEndAt(
                    toInputValue(
                        screeningResponse.endAt,
                    ),
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
                        'Unable to load screening.',
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
        screeningId,
        reloadKey,
    ])

    const seatRows =
        useMemo(() => {
            const rows =
                new Map<
                    string,
                    AdminScreeningSeat[]
                >()

            for (const seat of seats) {
                const current =
                    rows.get(
                        seat.rowLabel,
                    ) ?? []

                current.push(seat)

                rows.set(
                    seat.rowLabel,
                    current,
                )
            }

            return Array.from(
                rows.entries(),
            )
                .map(
                    ([
                         label,
                         rowSeats,
                     ]) => ({
                        label,
                        seats:
                            [...rowSeats].sort(
                                (
                                    first,
                                    second,
                                ) =>
                                    first.number -
                                    second.number,
                            ),
                    }),
                )
                .sort(
                    (first, second) =>
                        first.label.localeCompare(
                            second.label,
                            undefined,
                            {
                                numeric: true,
                            },
                        ),
                )
        }, [seats])

    async function handleUpdate(
        event: FormEvent,
    ) {
        event.preventDefault()

        if (
            !screening ||
            !movieId ||
            !startAt ||
            !endAt
        ) {
            return
        }

        setSaving(true)
        setError(null)

        try {
            const response =
                await updateAdminScreening(
                    screening.id,
                    {
                        movieId:
                            Number(movieId),
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

            setScreening(response)

            setMovieId(
                String(
                    response.movieId,
                ),
            )

            setStartAt(
                toInputValue(
                    response.startAt,
                ),
            )

            setEndAt(
                toInputValue(
                    response.endAt,
                ),
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to update screening.',
                )
            }
        } finally {
            setSaving(false)
        }
    }

    async function handleCancel() {
        if (!screening) {
            return
        }

        setCancelling(true)
        setError(null)

        try {
            await cancelAdminScreening(
                screening.id,
            )

            setCancelDialog(false)

            setReloadKey(
                (current) =>
                    current + 1,
            )
        } catch (error) {
            setCancelDialog(false)

            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to cancel screening.',
                )
            }
        } finally {
            setCancelling(false)
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
        !screening
    ) {
        return (
            <section className="admin-page">
                <div className="content-state">
                    <div className="content-state__icon">
                        404
                    </div>

                    <h2>
                        Screening not found
                    </h2>

                    <Link
                        to="/admin/screenings"
                        className="button button--primary"
                    >
                        Back to screenings
                    </Link>
                </div>
            </section>
        )
    }

    const editable =
        screening.status ===
        'SCHEDULED' &&
        new Date(
            screening.startAt,
        ).getTime() >
        Date.now()

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
                        Screening #
                        {screening.id}
                    </p>

                    <h1>
                        {
                            screening.movieTitle
                        }
                    </h1>

                    <p>
                        {screening.hallName} ·{' '}
                        {formatDateTime(
                            screening.startAt,
                        )}
                    </p>
                </div>

                <span
                    className={
                        screening.status ===
                        'SCHEDULED'
                            ? 'admin-status admin-status--active'
                            : 'admin-status admin-status--disabled'
                    }
                >
          {screening.status}
        </span>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            <div className="admin-screening-summary">
                <div>
                    <span>Movie</span>

                    <strong>
                        {
                            screening.movieTitle
                        }
                    </strong>
                </div>

                <div>
                    <span>Hall</span>

                    <strong>
                        {
                            screening.hallName
                        }
                    </strong>
                </div>

                <div>
                    <span>Start</span>

                    <strong>
                        {formatDateTime(
                            screening.startAt,
                        )}
                    </strong>
                </div>

                <div>
                    <span>End</span>

                    <strong>
                        {formatDateTime(
                            screening.endAt,
                        )}
                    </strong>
                </div>

                <div>
                    <span>Seats</span>

                    <strong>
                        {seats.length}
                    </strong>
                </div>
            </div>

            <form
                className="admin-screening-form"
                onSubmit={handleUpdate}
            >
                <div className="admin-screening-form__header">
                    <p className="eyebrow">
                        Edit screening
                    </p>

                    <h2>
                        Programme settings
                    </h2>

                    {!editable && (
                        <p>
                            This screening can no
                            longer be modified.
                        </p>
                    )}
                </div>

                <label>
                    <span>Movie</span>

                    <select
                        value={movieId}
                        disabled={!editable}
                        onChange={(event) =>
                            setMovieId(
                                event.target.value,
                            )
                        }
                    >
                        {movies.map(
                            (movie) => (
                                <option
                                    key={movie.id}
                                    value={movie.id}
                                >
                                    {movie.title}
                                </option>
                            ),
                        )}
                    </select>
                </label>

                <label>
                    <span>Hall</span>

                    <input
                        value={
                            screening.hallName
                        }
                        disabled
                    />
                </label>

                <label>
                    <span>Start</span>

                    <input
                        type="datetime-local"
                        value={startAt}
                        disabled={!editable}
                        onChange={(event) =>
                            setStartAt(
                                event.target.value,
                            )
                        }
                    />
                </label>

                <label>
                    <span>End</span>

                    <input
                        type="datetime-local"
                        value={endAt}
                        disabled={!editable}
                        onChange={(event) =>
                            setEndAt(
                                event.target.value,
                            )
                        }
                    />
                </label>

                {editable && (
                    <div className="admin-screening-form__actions">
                        <button
                            type="submit"
                            className="button button--primary"
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : 'Save changes'}
                        </button>
                    </div>
                )}
            </form>

            <div className="admin-seat-layout">
                <div className="admin-seat-layout__heading">
                    <div>
                        <p className="eyebrow">
                            Snapshot
                        </p>

                        <h2>
                            Screening seats
                        </h2>

                        <p>
                            These seats were copied
                            from the hall when the
                            screening was created.
                        </p>
                    </div>
                </div>

                {seatRows.length === 0 ? (
                    <div className="admin-seat-layout__empty">
                        No seats assigned to this
                        screening.
                    </div>
                ) : (
                    <div className="admin-seat-map">
                        <div className="admin-seat-screen">
                            SCREEN
                        </div>

                        {seatRows.map(
                            (row) => (
                                <div
                                    key={row.label}
                                    className="admin-seat-row"
                                >
                  <span className="admin-seat-row__label">
                    {row.label}
                  </span>

                                    <div className="admin-seat-row__seats">
                                        {row.seats.map(
                                            (seat) => (
                                                <div
                                                    key={
                                                        seat.id
                                                    }
                                                    className="admin-seat admin-seat--active"
                                                >
                                                    {
                                                        seat.number
                                                    }
                                                </div>
                                            ),
                                        )}
                                    </div>

                                    <span className="admin-seat-row__label">
                    {row.label}
                  </span>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </div>

            {screening.status ===
                'SCHEDULED' && (
                    <div className="admin-danger-zone">
                        <div>
                            <p className="eyebrow">
                                Cancel screening
                            </p>

                            <h2>
                                Remove from programme
                            </h2>

                            <p>
                                Cancelling the screening
                                is logical. Existing
                                active reservations for
                                this screening will also
                                be cancelled.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="button button--danger"
                            disabled={!editable}
                            onClick={() =>
                                setCancelDialog(true)
                            }
                        >
                            Cancel screening
                        </button>
                    </div>
                )}

            {cancelDialog && (
                <div
                    className="admin-dialog-backdrop"
                    onMouseDown={() =>
                        setCancelDialog(false)
                    }
                >
                    <div
                        className="admin-dialog"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <p className="eyebrow">
                            Confirm cancellation
                        </p>

                        <h2>
                            Cancel screening?
                        </h2>

                        <p>
                            {screening.movieTitle}{' '}
                            in{' '}
                            {
                                screening.hallName
                            }{' '}
                            will be cancelled.
                            Active reservations
                            will also be cancelled.
                        </p>

                        <div className="admin-dialog__actions">
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() =>
                                    setCancelDialog(
                                        false,
                                    )
                                }
                            >
                                Keep screening
                            </button>

                            <button
                                type="button"
                                className="button button--danger"
                                disabled={cancelling}
                                onClick={() =>
                                    void handleCancel()
                                }
                            >
                                {cancelling
                                    ? 'Cancelling...'
                                    : 'Cancel screening'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}