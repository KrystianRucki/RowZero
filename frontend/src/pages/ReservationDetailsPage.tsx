import {
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    Link,
    useParams,
} from 'react-router-dom'
import { isApiError } from '../api/apiError'
import {
    cancelReservation,
    confirmReservation,
    getReservation,
} from '../reservations/reservationApi'
import type { Reservation } from '../reservations/reservationTypes'
import {
    formatCountdown,
    getRemainingSeconds,
} from '../utils/countdown'
import {
    formatLongDate,
    formatScreeningTime,
} from '../utils/dateTime'
import '../styles/reservationDetails.css'

function parseReservationId(
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

export function ReservationDetailsPage() {
    const { id } = useParams()

    const reservationId =
        parseReservationId(id)

    const [
        reservation,
        setReservation,
    ] = useState<Reservation | null>(
        null,
    )

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    )

    const [
        notFound,
        setNotFound,
    ] = useState(false)

    const [
        actionLoading,
        setActionLoading,
    ] = useState(false)

    const [
        actionError,
        setActionError,
    ] = useState<string | null>(
        null,
    )

    const [
        remainingSeconds,
        setRemainingSeconds,
    ] = useState(0)

    const [
        reloadKey,
        setReloadKey,
    ] = useState(0)

    const expiryRefreshStarted =
        useRef(false)

    useEffect(() => {
        if (reservationId === null) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const currentReservationId =
            reservationId

        const controller =
            new AbortController()

        async function loadPage() {
            setLoading(true)
            setError(null)
            setNotFound(false)

            try {
                const response =
                    await getReservation(
                        currentReservationId,
                        controller.signal,
                    )

                setReservation(response)

                expiryRefreshStarted.current =
                    false
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

        void loadPage()

        return () => {
            controller.abort()
        }
    }, [
        reservationId,
        reloadKey,
    ])

    useEffect(() => {
        if (
            reservation?.status !==
            'HELD' ||
            !reservation.expiresAt
        ) {
            setRemainingSeconds(0)
            return
        }

        const expiresAt =
            reservation.expiresAt

        function updateCountdown() {
            setRemainingSeconds(
                getRemainingSeconds(
                    expiresAt,
                ),
            )
        }

        updateCountdown()

        const interval =
            window.setInterval(
                updateCountdown,
                1000,
            )

        return () => {
            window.clearInterval(
                interval,
            )
        }
    }, [reservation])

    useEffect(() => {
        if (
            reservationId === null ||
            reservation?.status !==
            'HELD' ||
            !reservation.expiresAt ||
            remainingSeconds !== 0 ||
            expiryRefreshStarted.current
        ) {
            return
        }

        const expiresAt =
            reservation.expiresAt

        if (
            new Date(
                expiresAt,
            ).getTime() >
            Date.now()
        ) {
            return
        }

        const currentReservationId =
            reservationId

        expiryRefreshStarted.current =
            true

        async function refreshExpired() {
            try {
                const response =
                    await getReservation(
                        currentReservationId,
                    )

                setReservation(response)
            } catch (error) {
                if (isApiError(error)) {
                    setActionError(
                        error.message,
                    )
                } else {
                    setActionError(
                        'Unable to refresh reservation status.',
                    )
                }
            }
        }

        void refreshExpired()
    }, [
        reservation,
        reservationId,
        remainingSeconds,
    ])

    async function handleConfirm() {
        if (!reservation) {
            return
        }

        const currentReservation =
            reservation

        setActionLoading(true)
        setActionError(null)

        try {
            const response =
                await confirmReservation(
                    currentReservation.id,
                )

            setReservation(response)
        } catch (error) {
            if (
                isApiError(error) &&
                error.status === 409
            ) {
                try {
                    const refreshed =
                        await getReservation(
                            currentReservation.id,
                        )

                    setReservation(refreshed)
                } catch {
                    setReloadKey(
                        (current) =>
                            current + 1,
                    )
                }

                setActionError(
                    'This hold can no longer be confirmed.',
                )

                return
            }

            if (isApiError(error)) {
                setActionError(
                    error.message,
                )
            } else {
                setActionError(
                    'Unable to confirm reservation.',
                )
            }
        } finally {
            setActionLoading(false)
        }
    }

    async function handleCancel() {
        if (!reservation) {
            return
        }

        const currentReservation =
            reservation

        setActionLoading(true)
        setActionError(null)

        try {
            const response =
                await cancelReservation(
                    currentReservation.id,
                )

            setReservation(response)
        } catch (error) {
            if (isApiError(error)) {
                setActionError(
                    error.message,
                )
            } else {
                setActionError(
                    'Unable to cancel reservation.',
                )
            }
        } finally {
            setActionLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="page reservation-details-page">
                <div className="reservation-details-loading">
                    <div className="skeleton reservation-details-loading__title" />
                    <div className="skeleton reservation-details-loading__card" />
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
                        Reservation not found
                    </h2>

                    <p>
                        This reservation does not
                        exist or does not belong to
                        your account.
                    </p>

                    <Link
                        to="/reservations"
                        className="button button--primary"
                    >
                        My reservations
                    </Link>
                </div>
            </section>
        )
    }

    if (
        error ||
        !reservation
    ) {
        return (
            <section className="page">
                <div className="content-state">
                    <div className="content-state__icon">
                        !
                    </div>

                    <h2>
                        We couldn't load this reservation
                    </h2>

                    <p>
                        {error ??
                            'Unable to load reservation.'}
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

    const canCancel =
        reservation.status ===
        'HELD' ||
        reservation.status ===
        'CONFIRMED'

    return (
        <section className="page reservation-details-page">
            <Link
                to="/reservations"
                className="back-link"
            >
                ← My reservations
            </Link>

            <div className="reservation-details-header">
                <div>
                    <p className="eyebrow">
                        Reservation #
                        {reservation.id}
                    </p>

                    <h1>
                        {reservation.movieTitle}
                    </h1>
                </div>

                <span
                    className={`reservation-status reservation-status--${reservation.status.toLowerCase()}`}
                >
          {reservation.status}
        </span>
            </div>

            {reservation.status ===
                'HELD' &&
                reservation.expiresAt && (
                    <div className="reservation-hold">
                        <div>
              <span>
                Your seat is held for
              </span>

                            <strong>
                                {formatCountdown(
                                    remainingSeconds,
                                )}
                            </strong>
                        </div>

                        <p>
                            Confirm before the timer
                            reaches zero or the seat
                            will become available to
                            other users.
                        </p>
                    </div>
                )}

            {reservation.status ===
                'CONFIRMED' && (
                    <div className="reservation-message reservation-message--success">
                        <strong>
                            Reservation confirmed
                        </strong>

                        <span>
              Your seat is reserved for
              this screening.
            </span>
                    </div>
                )}

            {reservation.status ===
                'EXPIRED' && (
                    <div className="reservation-message">
                        <strong>
                            Hold expired
                        </strong>

                        <span>
              The seat has been released
              and can now be reserved by
              another user.
            </span>
                    </div>
                )}

            {reservation.status ===
                'CANCELLED' && (
                    <div className="reservation-message">
                        <strong>
                            Reservation cancelled
                        </strong>

                        <span>
              This reservation is no
              longer active.
            </span>
                    </div>
                )}

            <div className="reservation-details-card">
                <div className="reservation-details-row">
                    <span>Date</span>

                    <strong>
                        {formatLongDate(
                            reservation.screeningStartAt,
                        )}
                    </strong>
                </div>

                <div className="reservation-details-row">
                    <span>Time</span>

                    <strong>
                        {formatScreeningTime(
                            reservation.screeningStartAt,
                            reservation.screeningEndAt,
                        )}
                    </strong>
                </div>

                <div className="reservation-details-row">
                    <span>Hall</span>

                    <strong>
                        {reservation.hallName}
                    </strong>
                </div>

                <div className="reservation-details-row">
                    <span>Seat</span>

                    <strong className="reservation-seat">
                        {reservation.rowLabel}
                        {reservation.seatNumber}
                    </strong>
                </div>
            </div>

            {actionError && (
                <div className="reservation-inline-error">
                    {actionError}
                </div>
            )}

            <div className="reservation-details-actions">
                {reservation.status ===
                    'HELD' && (
                        <button
                            type="button"
                            className="button button--primary"
                            disabled={
                                actionLoading ||
                                remainingSeconds === 0
                            }
                            onClick={
                                handleConfirm
                            }
                        >
                            {actionLoading
                                ? 'Processing...'
                                : 'Confirm reservation'}
                        </button>
                    )}

                {canCancel && (
                    <button
                        type="button"
                        className="button button--secondary"
                        disabled={
                            actionLoading
                        }
                        onClick={
                            handleCancel
                        }
                    >
                        Cancel reservation
                    </button>
                )}

                <Link
                    to={`/screenings/${reservation.screeningId}`}
                    className="button button--secondary"
                >
                    Screening details
                </Link>
            </div>
        </section>
    )
}