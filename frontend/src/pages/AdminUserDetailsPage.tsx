import {
    useEffect,
    useState,
} from 'react'
import {
    Link,
    useParams,
} from 'react-router-dom'
import { isApiError } from '../api/apiError'
import {
    getAdminUser,
    updateAdminUserStatus,
} from '../admin/adminUserApi'
import type { AdminUser } from '../admin/adminUserTypes'
import {
    formatDateTime,
} from '../utils/dateTime'
import '../styles/admin.css'

function parseUserId(
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

export function AdminUserDetailsPage() {
    const { id } = useParams()

    const userId =
        parseUserId(id)

    const [
        user,
        setUser,
    ] =
        useState<AdminUser | null>(
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
        updating,
        setUpdating,
    ] = useState(false)

    const [
        confirmingDeactivate,
        setConfirmingDeactivate,
    ] = useState(false)

    useEffect(() => {
        if (userId === null) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const currentUserId =
            userId

        const controller =
            new AbortController()

        async function loadUser() {
            setLoading(true)
            setError(null)
            setNotFound(false)

            try {
                const response =
                    await getAdminUser(
                        currentUserId,
                        controller.signal,
                    )

                setUser(response)
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
                        'Unable to load user.',
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

        void loadUser()

        return () => {
            controller.abort()
        }
    }, [userId])

    async function handleStatusChange() {
        if (!user) {
            return
        }

        const currentUser = user

        setUpdating(true)
        setError(null)

        try {
            const response =
                await updateAdminUserStatus(
                    currentUser.id,
                    !currentUser.enabled,
                )

            setUser(response)
            setConfirmingDeactivate(false)
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to update user status.',
                )
            }
        } finally {
            setUpdating(false)
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
        !user
    ) {
        return (
            <section className="admin-page">
                <div className="content-state">
                    <div className="content-state__icon">
                        404
                    </div>

                    <h2>
                        User not found
                    </h2>

                    <p>
                        This account does not
                        exist.
                    </p>

                    <Link
                        to="/admin/users"
                        className="button button--primary"
                    >
                        Back to users
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section className="admin-page">
            <Link
                to="/admin/users"
                className="back-link"
            >
                ← Back to users
            </Link>

            <div className="admin-page-heading admin-page-heading--details">
                <div>
                    <p className="eyebrow">
                        User #{user.id}
                    </p>

                    <h1>
                        {user.email}
                    </h1>

                    <p>
                        Account information and
                        access management.
                    </p>
                </div>

                <span
                    className={
                        user.enabled
                            ? 'admin-status admin-status--active'
                            : 'admin-status admin-status--disabled'
                    }
                >
          {user.enabled
              ? 'Active'
              : 'Disabled'}
        </span>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            <div className="admin-details-card">
                <div className="admin-details-row">
          <span>
            Email
          </span>

                    <strong>
                        {user.email}
                    </strong>
                </div>

                <div className="admin-details-row">
          <span>
            Role
          </span>

                    <strong>
                        {user.role}
                    </strong>
                </div>

                <div className="admin-details-row">
          <span>
            Status
          </span>

                    <strong>
                        {user.enabled
                            ? 'Active'
                            : 'Disabled'}
                    </strong>
                </div>

                <div className="admin-details-row">
          <span>
            Created
          </span>

                    <strong>
                        {formatDateTime(
                            user.createdAt,
                        )}
                    </strong>
                </div>
            </div>

            {user.role === 'USER' && (
                <div className="admin-danger-zone">
                    <div>
                        <p className="eyebrow">
                            Account access
                        </p>

                        <h2>
                            {user.enabled
                                ? 'Deactivate account'
                                : 'Reactivate account'}
                        </h2>

                        <p>
                            {user.enabled
                                ? 'The user will lose access and active future reservations will be cancelled.'
                                : 'The user will regain access. Previously cancelled reservations will not be restored.'}
                        </p>
                    </div>

                    <button
                        type="button"
                        className={
                            user.enabled
                                ? 'button button--danger'
                                : 'button button--primary'
                        }
                        disabled={updating}
                        onClick={() => {
                            if (user.enabled) {
                                setConfirmingDeactivate(
                                    true,
                                )
                            } else {
                                void handleStatusChange()
                            }
                        }}
                    >
                        {updating
                            ? 'Saving...'
                            : user.enabled
                                ? 'Deactivate user'
                                : 'Reactivate user'}
                    </button>
                </div>
            )}

            {confirmingDeactivate && (
                <div
                    className="admin-dialog-backdrop"
                    onMouseDown={() =>
                        setConfirmingDeactivate(
                            false,
                        )
                    }
                >
                    <div
                        className="admin-dialog"
                        onMouseDown={(
                            event,
                        ) =>
                            event.stopPropagation()
                        }
                    >
                        <p className="eyebrow">
                            Confirm action
                        </p>

                        <h2>
                            Deactivate this user?
                        </h2>

                        <p>
                            Active reservations for
                            future screenings will
                            be cancelled and the
                            user will no longer be
                            able to log in.
                        </p>

                        <div className="admin-dialog__actions">
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() =>
                                    setConfirmingDeactivate(
                                        false,
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button--danger"
                                disabled={updating}
                                onClick={() =>
                                    void handleStatusChange()
                                }
                            >
                                {updating
                                    ? 'Deactivating...'
                                    : 'Deactivate user'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}