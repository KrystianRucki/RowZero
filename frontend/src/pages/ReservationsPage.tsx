import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import { isApiError } from '../api/apiError'
import { ReservationCard } from '../components/ReservationCard'
import { getMyReservations } from '../reservations/reservationApi'
import type { Reservation } from '../reservations/reservationTypes'
import '../styles/userArea.css'

export function ReservationsPage() {
    const [
        reservations,
        setReservations,
    ] =
        useState<Reservation[]>([])

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
        reloadKey,
        setReloadKey,
    ] = useState(0)

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadReservations() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getMyReservations(
                        controller.signal,
                    )

                setReservations(
                    response,
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
                        'Unable to load your reservations.',
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
    }, [reloadKey])

    const {
        activeReservations,
        historyReservations,
    } = useMemo(() => {
        const now = Date.now()

        const active: Reservation[] =
            []

        const history: Reservation[] =
            []

        for (
            const reservation
            of reservations
            ) {
            const screeningFuture =
                new Date(
                    reservation.screeningStartAt,
                ).getTime() > now

            if (
                reservation.status ===
                'HELD' ||
                (
                    reservation.status ===
                    'CONFIRMED' &&
                    screeningFuture
                )
            ) {
                active.push(
                    reservation,
                )
            } else {
                history.push(
                    reservation,
                )
            }
        }

        active.sort(
            (first, second) =>
                new Date(
                    first.screeningStartAt,
                ).getTime() -
                new Date(
                    second.screeningStartAt,
                ).getTime(),
        )

        history.sort(
            (first, second) =>
                new Date(
                    second.createdAt,
                ).getTime() -
                new Date(
                    first.createdAt,
                ).getTime(),
        )

        return {
            activeReservations: active,
            historyReservations: history,
        }
    }, [reservations])

    return (
        <section className="page user-area-page">
            <div className="user-area-heading">
                <div>
                    <p className="eyebrow">
                        Your festival
                    </p>

                    <h1>
                        My reservations
                    </h1>

                    <p>
                        Manage active holds,
                        confirmed seats and your
                        reservation history.
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
                    Refresh
                </button>
            </div>

            {loading && (
                <div className="user-list">
                    {Array.from({
                        length: 3,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="user-list-skeleton skeleton"
                        />
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="content-state">
                    <div className="content-state__icon">
                        !
                    </div>

                    <h2>
                        We couldn't load your reservations
                    </h2>

                    <p>{error}</p>

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
            )}

            {!loading &&
                !error &&
                reservations.length === 0 && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No reservations yet
                        </h2>

                        <p>
                            Choose a screening and
                            reserve your first seat.
                        </p>
                    </div>
                )}

            {!loading &&
                !error &&
                reservations.length > 0 && (
                    <>
                        <section className="user-area-section">
                            <div className="user-area-section__heading">
                                <h2>Active</h2>

                                <span>
                                    {
                                        activeReservations.length
                                    }
                                </span>
                            </div>

                            {activeReservations.length >
                            0 ? (
                                <div className="user-list">
                                    {activeReservations.map(
                                        (reservation) => (
                                            <ReservationCard
                                                key={
                                                    reservation.id
                                                }
                                                reservation={
                                                    reservation
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="user-area-empty">
                                    No active reservations.
                                </div>
                            )}
                        </section>

                        <section className="user-area-section">
                            <div className="user-area-section__heading">
                                <h2>History</h2>

                                <span>
                                    {
                                        historyReservations.length
                                    }
                                </span>
                            </div>

                            {historyReservations.length >
                            0 ? (
                                <div className="user-list">
                                    {historyReservations.map(
                                        (reservation) => (
                                            <ReservationCard
                                                key={
                                                    reservation.id
                                                }
                                                reservation={
                                                    reservation
                                                }
                                            />
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="user-area-empty">
                                    No previous reservations.
                                </div>
                            )}
                        </section>
                    </>
                )}
        </section>
    )
}