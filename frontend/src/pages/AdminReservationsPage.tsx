import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useSearchParams,
} from 'react-router-dom'
import {
    getAdminReservations,
} from '../admin/adminReservationApi'
import type {
    AdminReservationPage,
    AdminReservationStatus,
} from '../admin/adminReservationTypes'
import { isApiError } from '../api/apiError'
import { formatDateTime } from '../utils/dateTime'
import '../styles/admin.css'

function parsePage(
    value: string | null,
) {
    if (!value) {
        return 0
    }

    const parsed =
        Number.parseInt(value, 10)

    if (
        Number.isNaN(parsed) ||
        parsed < 0
    ) {
        return 0
    }

    return parsed
}

function parseScreeningId(
    value: string,
) {
    if (!value.trim()) {
        return undefined
    }

    const parsed =
        Number.parseInt(
            value,
            10,
        )

    if (
        Number.isNaN(parsed) ||
        parsed <= 0
    ) {
        return undefined
    }

    return parsed
}

export function AdminReservationsPage() {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams()

    const page =
        parsePage(
            searchParams.get('page'),
        )

    const email =
        searchParams.get('email') ??
        ''

    const status =
        searchParams.get('status') ??
        ''

    const date =
        searchParams.get('date') ??
        ''

    const screeningId =
        searchParams.get(
            'screeningId',
        ) ?? ''

    const [
        emailInput,
        setEmailInput,
    ] = useState(email)

    const [
        statusInput,
        setStatusInput,
    ] = useState(status)

    const [
        dateInput,
        setDateInput,
    ] = useState(date)

    const [
        screeningInput,
        setScreeningInput,
    ] = useState(screeningId)

    const [
        reservationsPage,
        setReservationsPage,
    ] =
        useState<AdminReservationPage | null>(
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

    useEffect(() => {
        setEmailInput(email)
        setStatusInput(status)
        setDateInput(date)
        setScreeningInput(
            screeningId,
        )
    }, [
        email,
        status,
        date,
        screeningId,
    ])

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadReservations() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getAdminReservations(
                        {
                            email:
                                email ||
                                undefined,
                            status:
                                status
                                    ? status as AdminReservationStatus
                                    : undefined,
                            date:
                                date ||
                                undefined,
                            screeningId:
                                parseScreeningId(
                                    screeningId,
                                ),
                            page,
                            size: 20,
                        },
                        controller.signal,
                    )

                setReservationsPage(
                    response,
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
                        'Unable to load reservations.',
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

        void loadReservations()

        return () => {
            controller.abort()
        }
    }, [
        page,
        email,
        status,
        date,
        screeningId,
    ])

    function handleFilters(
        event: FormEvent,
    ) {
        event.preventDefault()

        const next =
            new URLSearchParams()

        const trimmedEmail =
            emailInput.trim()

        if (trimmedEmail) {
            next.set(
                'email',
                trimmedEmail,
            )
        }

        if (statusInput) {
            next.set(
                'status',
                statusInput,
            )
        }

        if (dateInput) {
            next.set(
                'date',
                dateInput,
            )
        }

        const parsedScreeningId =
            parseScreeningId(
                screeningInput,
            )

        if (parsedScreeningId) {
            next.set(
                'screeningId',
                String(
                    parsedScreeningId,
                ),
            )
        }

        next.set('page', '0')

        setSearchParams(next)
    }

    function clearFilters() {
        setSearchParams(
            new URLSearchParams({
                page: '0',
            }),
        )
    }

    function changePage(
        nextPage: number,
    ) {
        const next =
            new URLSearchParams(
                searchParams,
            )

        next.set(
            'page',
            String(nextPage),
        )

        setSearchParams(next)
    }

    const reservations =
        reservationsPage?.content ??
        []

    const totalPages =
        reservationsPage?.totalPages ??
        0

    return (
        <section className="admin-page">
            <div className="admin-page-heading">
                <div>
                    <p className="eyebrow">
                        Reservations
                    </p>

                    <h1>
                        Reservations
                    </h1>

                    <p>
                        Browse and filter all
                        festival reservations.
                    </p>
                </div>

                {reservationsPage && (
                    <div className="admin-total">
                        <strong>
                            {
                                reservationsPage.totalElements
                            }
                        </strong>

                        <span>
              reservations
            </span>
                    </div>
                )}
            </div>

            <form
                className="admin-reservation-filters"
                onSubmit={handleFilters}
            >
                <label>
                    <span>User email</span>

                    <input
                        type="search"
                        placeholder="user@example.com"
                        value={emailInput}
                        onChange={(event) =>
                            setEmailInput(
                                event.target.value,
                            )
                        }
                    />
                </label>

                <label>
                    <span>Status</span>

                    <select
                        value={statusInput}
                        onChange={(event) =>
                            setStatusInput(
                                event.target.value,
                            )
                        }
                    >
                        <option value="">
                            All statuses
                        </option>

                        <option value="HELD">
                            HELD
                        </option>

                        <option value="CONFIRMED">
                            CONFIRMED
                        </option>

                        <option value="CANCELLED">
                            CANCELLED
                        </option>

                        <option value="EXPIRED">
                            EXPIRED
                        </option>
                    </select>
                </label>

                <label>
                    <span>Date</span>

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

                <label>
                    <span>Screening ID</span>

                    <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={screeningInput}
                        onChange={(event) =>
                            setScreeningInput(
                                event.target.value,
                            )
                        }
                    />
                </label>

                <div className="admin-reservation-filters__actions">
                    <button
                        type="submit"
                        className="button button--primary"
                    >
                        Apply filters
                    </button>

                    <button
                        type="button"
                        className="button button--secondary"
                        onClick={
                            clearFilters
                        }
                    >
                        Clear
                    </button>
                </div>
            </form>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {loading && (
                <div className="admin-table-loading">
                    {Array.from({
                        length: 6,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="skeleton admin-table-skeleton"
                        />
                    ))}
                </div>
            )}

            {!loading &&
                reservations.length ===
                0 && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No reservations found
                        </h2>

                        <p>
                            No reservations match
                            the current filters.
                        </p>
                    </div>
                )}

            {!loading &&
                reservations.length >
                0 && (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Movie</th>
                                    <th>Seat</th>
                                    <th>Screening</th>
                                    <th>Status</th>
                                    <th />
                                </tr>
                                </thead>

                                <tbody>
                                {reservations.map(
                                    (
                                        reservation,
                                    ) => (
                                        <tr
                                            key={
                                                reservation.id
                                            }
                                        >
                                            <td>
                                                <div className="admin-screening-title">
                                                    <strong>
                                                        {
                                                            reservation.userEmail
                                                        }
                                                    </strong>

                                                    <span>
                              User #
                                                        {
                                                            reservation.userId
                                                        }
                            </span>
                                                </div>
                                            </td>

                                            <td>
                                                <div className="admin-screening-title">
                                                    <strong>
                                                        {
                                                            reservation.movieTitle
                                                        }
                                                    </strong>

                                                    <span>
                              {
                                  reservation.hallName
                              }
                            </span>
                                                </div>
                                            </td>

                                            <td>
                                                <strong className="admin-reservation-seat">
                                                    {
                                                        reservation.rowLabel
                                                    }
                                                    {
                                                        reservation.seatNumber
                                                    }
                                                </strong>
                                            </td>

                                            <td>
                                                <div className="admin-screening-title">
                                                    <strong>
                                                        {formatDateTime(
                                                            reservation.screeningStartAt,
                                                        )}
                                                    </strong>

                                                    <span>
                              #
                                                        {
                                                            reservation.screeningId
                                                        }
                            </span>
                                                </div>
                                            </td>

                                            <td>
                          <span
                              className={`admin-reservation-status admin-reservation-status--${reservation.status.toLowerCase()}`}
                          >
                            {
                                reservation.status
                            }
                          </span>
                                            </td>

                                            <td>
                                                <div className="admin-table-actions">
                                                    <Link
                                                        to={`/admin/reservations/${reservation.id}`}
                                                        className="button button--secondary button--small"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="admin-pagination">
                            <button
                                type="button"
                                className="button button--secondary"
                                disabled={
                                    page === 0
                                }
                                onClick={() =>
                                    changePage(
                                        page - 1,
                                    )
                                }
                            >
                                Previous
                            </button>

                            <span>
                Page{' '}
                                {totalPages > 0
                                    ? page + 1
                                    : 0}{' '}
                                of {totalPages}
              </span>

                            <button
                                type="button"
                                className="button button--secondary"
                                disabled={
                                    page + 1 >=
                                    totalPages
                                }
                                onClick={() =>
                                    changePage(
                                        page + 1,
                                    )
                                }
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
        </section>
    )
}