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
import {
    getScreening,
    getScreeningSeats,
} from '../screenings/screeningApi'
import type {
    Screening,
    ScreeningSeat,
} from '../screenings/screeningTypes'
import {
    formatLongDate,
    formatScreeningTime,
} from '../utils/dateTime'
import '../styles/screeningDetails.css'

function parseScreeningId(
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

export function ScreeningDetailsPage() {
    const { id } = useParams()

    const screeningId =
        parseScreeningId(id)

    const [
        screening,
        setScreening,
    ] =
        useState<Screening | null>(
            null,
        )

    const [
        seats,
        setSeats,
    ] =
        useState<ScreeningSeat[]>([])

    const [
        selectedSeatId,
        setSelectedSeatId,
    ] =
        useState<number | null>(
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
        reloadKey,
        setReloadKey,
    ] = useState(0)

    useEffect(() => {
        if (screeningId === null) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const currentScreeningId =
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
                ] = await Promise.all([
                    getScreening(
                        currentScreeningId,
                        controller.signal,
                    ),
                    getScreeningSeats(
                        currentScreeningId,
                        controller.signal,
                    ),
                ])

                setScreening(
                    screeningResponse,
                )

                setSeats(
                    seatsResponse,
                )

                setSelectedSeatId(
                    (current) => {
                        if (
                            current === null
                        ) {
                            return null
                        }

                        const selected =
                            seatsResponse.find(
                                (seat) =>
                                    seat.id ===
                                    current,
                            )

                        if (
                            !selected ||
                            !selected.available
                        ) {
                            return null
                        }

                        return current
                    },
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
                        'Unable to load screening details.',
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

    const rows = useMemo(() => {
        const grouped =
            new Map<
                string,
                ScreeningSeat[]
            >()

        for (const seat of seats) {
            const row =
                grouped.get(
                    seat.rowLabel,
                ) ?? []

            row.push(seat)

            grouped.set(
                seat.rowLabel,
                row,
            )
        }

        return Array.from(
            grouped.entries(),
        )
            .map(
                ([
                     rowLabel,
                     rowSeats,
                 ]) => ({
                    rowLabel,
                    seats: [...rowSeats].sort(
                        (first, second) =>
                            first.number -
                            second.number,
                    ),
                }),
            )
            .sort(
                (first, second) =>
                    first.rowLabel.localeCompare(
                        second.rowLabel,
                        undefined,
                        {
                            numeric: true,
                        },
                    ),
            )
    }, [seats])

    const selectedSeat =
        useMemo(
            () =>
                seats.find(
                    (seat) =>
                        seat.id ===
                        selectedSeatId,
                ) ?? null,
            [
                seats,
                selectedSeatId,
            ],
        )

    const availableSeats =
        seats.filter(
            (seat) =>
                seat.available,
        ).length

    function selectSeat(
        seat: ScreeningSeat,
    ) {
        if (!seat.available) {
            return
        }

        setSelectedSeatId(
            (current) =>
                current === seat.id
                    ? null
                    : seat.id,
        )
    }

    if (loading) {
        return (
            <section className="page screening-details-page">
                <div className="screening-details-loading">
                    <div className="skeleton screening-details-loading__title" />

                    <div className="skeleton screening-details-loading__meta" />

                    <div className="skeleton screening-details-loading__map" />
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

                    <h2>
                        Screening not found
                    </h2>

                    <p>
                        This screening does not
                        exist or is no longer
                        available.
                    </p>

                    <Link
                        to="/schedule"
                        className="button button--primary"
                    >
                        Back to schedule
                    </Link>
                </div>
            </section>
        )
    }

    if (
        error ||
        !screening
    ) {
        return (
            <section className="page">
                <div className="content-state">
                    <div className="content-state__icon">
                        !
                    </div>

                    <h2>
                        We couldn't load this screening
                    </h2>

                    <p>
                        {error ??
                            'Unable to load screening details.'}
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

    return (
        <section className="page screening-details-page">
            <Link
                to="/schedule"
                className="back-link"
            >
                ← Back to schedule
            </Link>

            <div className="screening-details-header">
                <div>
                    <p className="eyebrow">
                        Screening
                    </p>

                    <h1>
                        {screening.movieTitle}
                    </h1>

                    <div className="screening-details-meta">
            <span>
              {formatLongDate(
                  screening.startAt,
              )}
            </span>

                        <span>
              {formatScreeningTime(
                  screening.startAt,
                  screening.endAt,
              )}
            </span>

                        <span>
              {screening.hallName}
            </span>
                    </div>
                </div>

                {screening.movieId && (
                    <Link
                        to={`/movies/${screening.movieId}`}
                        className="button button--secondary"
                    >
                        Film details
                    </Link>
                )}
            </div>

            <div className="seat-section">
                <div className="seat-section__heading">
                    <div>
                        <p className="eyebrow">
                            Seat selection
                        </p>

                        <h2>
                            Choose your seat
                        </h2>

                        <p>
                            Select one available
                            seat for this screening.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="button button--secondary"
                        onClick={() =>
                            setReloadKey(
                                (current) =>
                                    current + 1,
                            )
                        }
                    >
                        Refresh availability
                    </button>
                </div>

                <div className="seat-legend">
                    <div>
                        <span className="seat-legend__seat seat-legend__seat--available" />
                        Available
                    </div>

                    <div>
                        <span className="seat-legend__seat seat-legend__seat--selected" />
                        Selected
                    </div>

                    <div>
                        <span className="seat-legend__seat seat-legend__seat--unavailable" />
                        Unavailable
                    </div>
                </div>

                {seats.length === 0 ? (
                    <div className="seat-map-empty">
                        <h3>
                            No seats available
                        </h3>

                        <p>
                            No seats are configured
                            for this screening.
                        </p>
                    </div>
                ) : (
                    <div className="seat-map-wrapper">
                        <div className="seat-screen">
                            <span>SCREEN</span>
                        </div>

                        <div className="seat-map">
                            {rows.map(
                                (row) => (
                                    <div
                                        className="seat-row"
                                        key={
                                            row.rowLabel
                                        }
                                    >
                    <span className="seat-row__label">
                      {
                          row.rowLabel
                      }
                    </span>

                                        <div className="seat-row__seats">
                                            {row.seats.map(
                                                (seat) => {
                                                    const selected =
                                                        seat.id ===
                                                        selectedSeatId

                                                    const className =
                                                        selected
                                                            ? 'seat seat--selected'
                                                            : seat.available
                                                                ? 'seat seat--available'
                                                                : 'seat seat--unavailable'

                                                    return (
                                                        <button
                                                            key={
                                                                seat.id
                                                            }
                                                            type="button"
                                                            className={
                                                                className
                                                            }
                                                            disabled={
                                                                !seat.available
                                                            }
                                                            onClick={() =>
                                                                selectSeat(
                                                                    seat,
                                                                )
                                                            }
                                                            aria-pressed={
                                                                selected
                                                            }
                                                            aria-label={`Seat ${seat.rowLabel}${seat.number}${
                                                                seat.available
                                                                    ? ''
                                                                    : ', unavailable'
                                                            }`}
                                                        >
                                                            {
                                                                seat.number
                                                            }
                                                        </button>
                                                    )
                                                },
                                            )}
                                        </div>

                                        <span className="seat-row__label">
                      {
                          row.rowLabel
                      }
                    </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                )}

                <div className="seat-selection-summary">
                    <div>
            <span>
              Selected seat
            </span>

                        <strong>
                            {selectedSeat
                                ? `${selectedSeat.rowLabel}${selectedSeat.number}`
                                : 'None'}
                        </strong>
                    </div>

                    <div>
            <span>
              Availability
            </span>

                        <strong>
                            {availableSeats} of{' '}
                            {seats.length}
                        </strong>
                    </div>

                    <p>
                        {selectedSeat
                            ? `Seat ${selectedSeat.rowLabel}${selectedSeat.number} is selected.`
                            : 'Choose one available seat to continue.'}
                    </p>
                </div>
            </div>
        </section>
    )
}