import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useSearchParams,
} from 'react-router-dom'
import {
    getAdminOccupancy,
} from '../admin/adminStatisticsApi'
import type {
    ScreeningOccupancy,
} from '../admin/adminStatisticsTypes'
import { isApiError } from '../api/apiError'
import { formatDateTime } from '../utils/dateTime'
import '../styles/admin.css'

export function AdminStatisticsPage() {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams()

    const date =
        searchParams.get('date') ??
        ''

    const [
        dateInput,
        setDateInput,
    ] = useState(date)

    const [
        occupancy,
        setOccupancy,
    ] =
        useState<
            ScreeningOccupancy[]
        >([])

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] =
        useState<string | null>(null)

    useEffect(() => {
        setDateInput(date)
    }, [date])

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadStatistics() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getAdminOccupancy(
                        date ||
                        undefined,
                        controller.signal,
                    )

                setOccupancy(
                    [...response].sort(
                        (
                            first,
                            second,
                        ) =>
                            new Date(
                                first.startAt,
                            ).getTime() -
                            new Date(
                                second.startAt,
                            ).getTime(),
                    ),
                )
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name ===
                    'AbortError'
                ) {
                    return
                }

                if (isApiError(error)) {
                    setError(
                        error.message,
                    )
                } else {
                    setError(
                        'Unable to load occupancy statistics.',
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

        void loadStatistics()

        return () => {
            controller.abort()
        }
    }, [date])

    const summary =
        useMemo(() => {
            const capacity =
                occupancy.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.capacity,
                    0,
                )

            const occupied =
                occupancy.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.occupiedSeats,
                    0,
                )

            const confirmed =
                occupancy.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.confirmedSeats,
                    0,
                )

            const held =
                occupancy.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.heldSeats,
                    0,
                )

            const available =
                occupancy.reduce(
                    (
                        total,
                        item,
                    ) =>
                        total +
                        item.availableSeats,
                    0,
                )

            const percent =
                capacity === 0
                    ? 0
                    : Math.round(
                    occupied *
                    1000 /
                    capacity,
                ) / 10

            return {
                capacity,
                occupied,
                confirmed,
                held,
                available,
                percent,
            }
        }, [occupancy])

    function handleFilter(
        event: FormEvent,
    ) {
        event.preventDefault()

        if (dateInput) {
            setSearchParams({
                date: dateInput,
            })
        } else {
            setSearchParams({})
        }
    }

    function clearDate() {
        setDateInput('')
        setSearchParams({})
    }

    return (
        <section className="admin-page">
            <div className="admin-page-heading">
                <div>
                    <p className="eyebrow">
                        Statistics
                    </p>

                    <h1>
                        Occupancy
                    </h1>

                    <p>
                        Monitor confirmed seats,
                        active holds and remaining
                        capacity for scheduled
                        screenings.
                    </p>
                </div>
            </div>

            <form
                className="admin-statistics-filter"
                onSubmit={handleFilter}
            >
                <label>
          <span>
            Screening date
          </span>

                    <input
                        type="date"
                        value={dateInput}
                        onChange={(event) =>
                            setDateInput(
                                event.target.value,
                            )
                        }
                    />
                </label>

                <button
                    type="submit"
                    className="button button--primary"
                >
                    Apply
                </button>

                <button
                    type="button"
                    className="button button--secondary"
                    onClick={clearDate}
                >
                    All scheduled
                </button>
            </form>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {!loading && (
                <div className="admin-statistics-summary">
                    <div>
            <span>
              Screenings
            </span>

                        <strong>
                            {occupancy.length}
                        </strong>
                    </div>

                    <div>
            <span>
              Capacity
            </span>

                        <strong>
                            {summary.capacity}
                        </strong>
                    </div>

                    <div>
            <span>
              Occupied
            </span>

                        <strong>
                            {summary.occupied}
                        </strong>
                    </div>

                    <div>
            <span>
              Confirmed
            </span>

                        <strong>
                            {summary.confirmed}
                        </strong>
                    </div>

                    <div>
            <span>
              Active holds
            </span>

                        <strong>
                            {summary.held}
                        </strong>
                    </div>

                    <div>
            <span>
              Occupancy
            </span>

                        <strong>
                            {summary.percent}%
                        </strong>
                    </div>
                </div>
            )}

            {loading && (
                <div className="admin-table-loading">
                    {Array.from({
                        length: 5,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="skeleton admin-table-skeleton"
                        />
                    ))}
                </div>
            )}

            {!loading &&
                occupancy.length === 0 && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No screenings
                        </h2>

                        <p>
                            No scheduled screenings
                            are available for this
                            date.
                        </p>
                    </div>
                )}

            {!loading &&
                occupancy.length > 0 && (
                    <div className="admin-occupancy-list">
                        {occupancy.map(
                            (item) => (
                                <article
                                    key={
                                        item.screeningId
                                    }
                                    className="admin-occupancy-card"
                                >
                                    <div className="admin-occupancy-card__heading">
                                        <div>
                      <span>
                        Screening #
                          {
                              item.screeningId
                          }
                      </span>

                                            <h2>
                                                {
                                                    item.movieTitle
                                                }
                                            </h2>

                                            <p>
                                                {
                                                    item.hallName
                                                }{' '}
                                                ·{' '}
                                                {formatDateTime(
                                                    item.startAt,
                                                )}
                                            </p>
                                        </div>

                                        <strong className="admin-occupancy-percent">
                                            {
                                                item.occupancyPercent
                                            }
                                            %
                                        </strong>
                                    </div>

                                    <div className="admin-occupancy-bar">
                                        <div
                                            className="admin-occupancy-bar__fill"
                                            style={{
                                                width: `${Math.min(
                                                    100,
                                                    Math.max(
                                                        0,
                                                        item.occupancyPercent,
                                                    ),
                                                )}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="admin-occupancy-data">
                                        <div>
                      <span>
                        Capacity
                      </span>

                                            <strong>
                                                {
                                                    item.capacity
                                                }
                                            </strong>
                                        </div>

                                        <div>
                      <span>
                        Confirmed
                      </span>

                                            <strong>
                                                {
                                                    item.confirmedSeats
                                                }
                                            </strong>
                                        </div>

                                        <div>
                      <span>
                        Held
                      </span>

                                            <strong>
                                                {
                                                    item.heldSeats
                                                }
                                            </strong>
                                        </div>

                                        <div>
                      <span>
                        Available
                      </span>

                                            <strong>
                                                {
                                                    item.availableSeats
                                                }
                                            </strong>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/admin/screenings/${item.screeningId}`}
                                        className="button button--secondary button--small"
                                    >
                                        View screening
                                    </Link>
                                </article>
                            ),
                        )}
                    </div>
                )}
        </section>
    )
}