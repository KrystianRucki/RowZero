import {
    useEffect,
    useState,
} from 'react'
import {
    Link,
    useParams,
} from 'react-router-dom'
import {
    cancelAdminReservation,
    getAdminReservation,
} from '../admin/adminReservationApi'
import type {
    AdminReservation,
} from '../admin/adminReservationTypes'
import { isApiError } from '../api/apiError'
import { formatDateTime } from '../utils/dateTime'
import '../styles/admin.css'

function parseReservationId(
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

export function AdminReservationDetailsPage() {
    const { id } = useParams()

    const reservationId =
        parseReservationId(id)

    const [
        reservation,
        setReservation,
    ] =
        useState<AdminReservation | null>(
            null,
        )

    const [
        loading,
        setLoading,
    ] = useState(true)

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

    useEffect(() => {
        if (
            reservationId === null
        ) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const currentId =
            reservationId

        const controller =
            new AbortController()

        async function loadReservation() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getAdminReservation(
                        currentId,
                        controller.signal,
                    )

                setReservation(
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

                if (
                    isApiError(error) &&
                    error.status === 404
                ) {
                    setNotFound(true)
                    return
                }

                if (isApiError(error)) {
                    setError(
                        error.message,
                    )
                } else {
                    setError(
                        'Unable to load reservation.',
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

        void loadReservation()

        return () => {
            controller.abort()
        }
    }, [reservationId])

    async function handleCancel() {
        if (!reservation) {
            return
        }

        setCancelling(true)
        setError(null)

        try {
            const response =
                await cancelAdminReservation(
                    reservation.id,
                )

            setReservation(
                response,
            )

            setCancelDialog(false)
        } catch (error) {
            setCancelDialog(false)

            if (isApiError(error)) {
                setError(
                    error.message,
                )
            } else {
                setError(
                    'Unable to cancel reservation.',
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
        !reservation
    ) {
        return (
            <section className="admin-page">
                <div className="content-state">
                    <div className="content-state__icon">
                        404
                    </div>

                    <h2>
                        Reservation not found
                    </h2>

                    <Link
                        to="/admin/reservations"
                        className="button button--primary"
                    >
                        Back to reservations
                    </Link>
                </div>
            </section>
        )
    }

    const now =
        Date.now()

    const screeningFuture =
        new Date(
            reservation.screeningStartAt,
        ).getTime() > now

    const activeHold =
        reservation.status ===
        'HELD' &&
        reservation.expiresAt !==
        null &&
        new Date(
            reservation.expiresAt,
        ).getTime() > now

    const canCancel =
        screeningFuture &&
        (
            reservation.status ===
            'CONFIRMED' ||
            activeHold
        )

    return (
        <section className="admin-page">
            <Link
                to="/admin/reservations"
                className="back-link"
            >
                ← Back to reservations
            </Link>

            <div className="admin-page-heading admin-page-heading--details">
                <div>
                    <p className="eyebrow">
                        Reservation #
                        {reservation.id}
                    </p>

                    <h1>
                        {
                            reservation.movieTitle
                        }
                    </h1>

                    <p>
                        {
                            reservation.userEmail
                        }
                    </p>
                </div>

                <span
                    className={`admin-reservation-status admin-reservation-status--${reservation.status.toLowerCase()}`}
                >
          {reservation.status}
        </span>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            <div className="admin-reservation-details-grid">
                <div className="admin-details-card">
                    <div className="admin-details-row">
            <span>
              User
            </span>

                        <strong>
                            {
                                reservation.userEmail
                            }
                        </strong>
                    </div>

                    <div className="admin-details-row">
            <span>
              User ID
            </span>

                        <strong>
                            #
                            {reservation.userId}
                        </strong>
                    </div>

                    <div className="admin-details-row">
            <span>
              Reservation created
            </span>

                        <strong>
                            {formatDateTime(
                                reservation.createdAt,
                            )}
                        </strong>
                    </div>

                    <div className="admin-details-row">
            <span>
              Status
            </span>

                        <strong>
                            {
                                reservation.status
                            }
                        </strong>
                    </div>
                </div>

                <div className="admin-details-card">
                    <div className="admin-details-row">
            <span>
              Screening
            </span>

                        <strong>
                            #
                            {
                                reservation.screeningId
                            }
                        </strong>
                    </div>

                    <div className="admin-details-row">
            <span>
              Hall
            </span>

                        <strong>
                            {
                                reservation.hallName
                            }
                        </strong>
                    </div>

                    <div className="admin-details-row">
            <span>
              Seat
            </span>

                        <strong className="admin-reservation-seat">
                            {
                                reservation.rowLabel
                            }
                            {
                                reservation.seatNumber
                            }
                        </strong>
                    </div>

                    <div className="admin-details-row">
            <span>
              Screening time
            </span>

                        <strong>
                            {formatDateTime(
                                reservation.screeningStartAt,
                            )}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="admin-reservation-timeline">
                <div>
                    <span>Created</span>
                    <strong>
                        {formatDateTime(
                            reservation.createdAt,
                        )}
                    </strong>
                </div>

                <div>
          <span>
            Hold expires
          </span>
                    <strong>
                        {reservation.expiresAt
                            ? formatDateTime(
                                reservation.expiresAt,
                            )
                            : '—'}
                    </strong>
                </div>

                <div>
          <span>
            Confirmed
          </span>
                    <strong>
                        {reservation.confirmedAt
                            ? formatDateTime(
                                reservation.confirmedAt,
                            )
                            : '—'}
                    </strong>
                </div>

                <div>
          <span>
            Cancelled
          </span>
                    <strong>
                        {reservation.cancelledAt
                            ? formatDateTime(
                                reservation.cancelledAt,
                            )
                            : '—'}
                    </strong>
                </div>
            </div>

            <div className="admin-reservation-links">
                <Link
                    to={`/admin/screenings/${reservation.screeningId}`}
                    className="button button--secondary"
                >
                    View screening
                </Link>

                <Link
                    to={`/admin/users/${reservation.userId}`}
                    className="button button--secondary"
                >
                    View user
                </Link>
            </div>

            {(reservation.status ===
                'HELD' ||
                reservation.status ===
                'CONFIRMED') && (
                <div className="admin-danger-zone">
                    <div>
                        <p className="eyebrow">
                            Reservation
                        </p>

                        <h2>
                            Cancel reservation
                        </h2>

                        <p>
                            The reservation will
                            remain in history with
                            status CANCELLED and the
                            seat will become
                            available again.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="button button--danger"
                        disabled={!canCancel}
                        onClick={() =>
                            setCancelDialog(
                                true,
                            )
                        }
                    >
                        Cancel reservation
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
                            Cancel reservation?
                        </h2>

                        <p>
                            Reservation #
                            {reservation.id} for{' '}
                            {
                                reservation.userEmail
                            }{' '}
                            will be cancelled.
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
                                Keep reservation
                            </button>

                            <button
                                type="button"
                                className="button button--danger"
                                disabled={
                                    cancelling
                                }
                                onClick={() =>
                                    void handleCancel()
                                }
                            >
                                {cancelling
                                    ? 'Cancelling...'
                                    : 'Cancel reservation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}