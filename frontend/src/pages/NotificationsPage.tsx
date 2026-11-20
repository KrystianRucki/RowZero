import {
    useEffect,
    useMemo,
    useState,
} from 'react'
import { isApiError } from '../api/apiError'
import {
    getNotifications,
    markNotificationRead,
} from '../notifications/notificationApi'
import type { Notification } from '../notifications/notificationTypes'
import {
    formatDateTime,
} from '../utils/dateTime'
import '../styles/userArea.css'

export function NotificationsPage() {
    const [
        notifications,
        setNotifications,
    ] =
        useState<Notification[]>([])

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
        markingId,
        setMarkingId,
    ] =
        useState<number | null>(null)

    const [
        reloadKey,
        setReloadKey,
    ] = useState(0)

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadNotifications() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getNotifications(
                        controller.signal,
                    )

                setNotifications(
                    [...response].sort(
                        (first, second) =>
                            new Date(
                                second.createdAt,
                            ).getTime() -
                            new Date(
                                first.createdAt,
                            ).getTime(),
                    ),
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
                        'Unable to load notifications.',
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

        void loadNotifications()

        return () => {
            controller.abort()
        }
    }, [reloadKey])

    const unreadCount =
        useMemo(
            () =>
                notifications.filter(
                    (notification) =>
                        notification.readAt ===
                        null,
                ).length,
            [notifications],
        )

    async function handleRead(
        notification: Notification,
    ) {
        if (
            notification.readAt ||
            markingId !== null
        ) {
            return
        }

        setMarkingId(
            notification.id,
        )

        try {
            await markNotificationRead(
                notification.id,
            )

            setNotifications(
                (current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            notification.id
                                ? {
                                    ...item,
                                    readAt:
                                        new Date()
                                            .toISOString(),
                                }
                                : item,
                    ),
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to mark notification as read.',
                )
            }
        } finally {
            setMarkingId(null)
        }
    }

    return (
        <section className="page user-area-page">
            <div className="user-area-heading">
                <div>
                    <p className="eyebrow">
                        Updates
                    </p>

                    <h1>
                        Notifications
                    </h1>

                    <p>
                        Reservation confirmations,
                        cancellations and expired
                        holds appear here.
                    </p>
                </div>

                <div className="notification-counter">
                    <strong>
                        {unreadCount}
                    </strong>

                    <span>unread</span>
                </div>
            </div>

            {loading && (
                <div className="user-list">
                    {Array.from({
                        length: 4,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="notification-skeleton skeleton"
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
                        We couldn't load notifications
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
                notifications.length === 0 && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No notifications
                        </h2>

                        <p>
                            Updates about your
                            reservations will appear
                            here.
                        </p>
                    </div>
                )}

            {!loading &&
                !error &&
                notifications.length > 0 && (
                    <div className="notification-list">
                        {notifications.map(
                            (notification) => (
                                <article
                                    key={
                                        notification.id
                                    }
                                    className={
                                        notification.readAt
                                            ? 'notification-card'
                                            : 'notification-card notification-card--unread'
                                    }
                                >
                                    <div className="notification-card__indicator" />

                                    <div className="notification-card__content">
                                        <div className="notification-card__meta">
                      <span>
                        {notification.type
                            .replace(
                                'RESERVATION_',
                                '',
                            )
                            .toLowerCase()}
                      </span>

                                            <time>
                                                {formatDateTime(
                                                    notification.createdAt,
                                                )}
                                            </time>
                                        </div>

                                        <p>
                                            {
                                                notification.message
                                            }
                                        </p>
                                    </div>

                                    {!notification.readAt && (
                                        <button
                                            type="button"
                                            className="notification-read-button"
                                            disabled={
                                                markingId ===
                                                notification.id
                                            }
                                            onClick={() =>
                                                handleRead(
                                                    notification,
                                                )
                                            }
                                        >
                                            {markingId ===
                                            notification.id
                                                ? 'Saving...'
                                                : 'Mark as read'}
                                        </button>
                                    )}
                                </article>
                            ),
                        )}
                    </div>
                )}
        </section>
    )
}