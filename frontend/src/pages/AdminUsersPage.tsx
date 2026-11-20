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
import { isApiError } from '../api/apiError'
import {
    getAdminUsers,
    updateAdminUserStatus,
} from '../admin/adminUserApi'
import type {
    AdminUser,
    AdminUsersPage,
} from '../admin/adminUserTypes'
import {
    formatDateTime,
} from '../utils/dateTime'
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

export function AdminUsersPage() {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams()

    const page =
        parsePage(
            searchParams.get('page'),
        )

    const search =
        searchParams.get('search') ??
        ''

    const status =
        searchParams.get('status') ??
        'all'

    const [
        searchInput,
        setSearchInput,
    ] = useState(search)

    const [
        usersPage,
        setUsersPage,
    ] =
        useState<AdminUsersPage | null>(
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
        updatingUserId,
        setUpdatingUserId,
    ] =
        useState<number | null>(null)

    const [
        confirmationUser,
        setConfirmationUser,
    ] =
        useState<AdminUser | null>(
            null,
        )

    const [
        reloadKey,
        setReloadKey,
    ] = useState(0)

    useEffect(() => {
        setSearchInput(search)
    }, [search])

    useEffect(() => {
        const controller =
            new AbortController()

        let enabled:
            | boolean
            | undefined

        if (status === 'active') {
            enabled = true
        }

        if (
            status === 'disabled'
        ) {
            enabled = false
        }

        async function loadUsers() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getAdminUsers(
                        {
                            search:
                                search ||
                                undefined,
                            enabled,
                            page,
                            size: 10,
                        },
                        controller.signal,
                    )

                setUsersPage(response)
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
                        'Unable to load users.',
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

        void loadUsers()

        return () => {
            controller.abort()
        }
    }, [
        page,
        search,
        status,
        reloadKey,
    ])

    const users =
        usersPage?.content ?? []

    const totalPages =
        usersPage?.totalPages ?? 0

    const canGoPrevious =
        page > 0

    const canGoNext =
        page + 1 < totalPages

    const pageLabel =
        useMemo(
            () =>
                totalPages > 0
                    ? `${page + 1} of ${totalPages}`
                    : '0 of 0',
            [
                page,
                totalPages,
            ],
        )

    function handleSearch(
        event: FormEvent,
    ) {
        event.preventDefault()

        const next =
            new URLSearchParams(
                searchParams,
            )

        const trimmed =
            searchInput.trim()

        if (trimmed) {
            next.set(
                'search',
                trimmed,
            )
        } else {
            next.delete('search')
        }

        next.set('page', '0')

        setSearchParams(next)
    }

    function changeStatus(
        value: string,
    ) {
        const next =
            new URLSearchParams(
                searchParams,
            )

        if (value === 'all') {
            next.delete('status')
        } else {
            next.set(
                'status',
                value,
            )
        }

        next.set('page', '0')

        setSearchParams(next)
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

    async function updateStatus(
        user: AdminUser,
    ) {
        setUpdatingUserId(user.id)
        setError(null)

        try {
            await updateAdminUserStatus(
                user.id,
                !user.enabled,
            )

            setConfirmationUser(null)

            setReloadKey(
                (current) =>
                    current + 1,
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to update user status.',
                )
            }
        } finally {
            setUpdatingUserId(null)
        }
    }

    return (
        <section className="admin-page">
            <div className="admin-page-heading">
                <div>
                    <p className="eyebrow">
                        Accounts
                    </p>

                    <h1>
                        Users
                    </h1>

                    <p>
                        Search accounts and
                        manage access to RowZero.
                    </p>
                </div>

                {usersPage && (
                    <div className="admin-total">
                        <strong>
                            {
                                usersPage.totalElements
                            }
                        </strong>

                        <span>
              users
            </span>
                    </div>
                )}
            </div>

            <div className="admin-toolbar">
                <form
                    className="admin-search"
                    onSubmit={handleSearch}
                >
                    <input
                        type="search"
                        value={searchInput}
                        placeholder="Search by email"
                        onChange={(event) =>
                            setSearchInput(
                                event.target.value,
                            )
                        }
                    />

                    <button
                        type="submit"
                        className="button button--primary"
                    >
                        Search
                    </button>
                </form>

                <select
                    className="admin-select"
                    value={status}
                    onChange={(event) =>
                        changeStatus(
                            event.target.value,
                        )
                    }
                >
                    <option value="all">
                        All accounts
                    </option>

                    <option value="active">
                        Active
                    </option>

                    <option value="disabled">
                        Disabled
                    </option>
                </select>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
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
                users.length === 0 && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No users found
                        </h2>

                        <p>
                            Try a different email
                            or account status.
                        </p>
                    </div>
                )}

            {!loading &&
                users.length > 0 && (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>
                                        Created
                                    </th>
                                    <th />
                                </tr>
                                </thead>

                                <tbody>
                                {users.map(
                                    (user) => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="admin-user-cell">
                                                    <div className="admin-user-avatar">
                                                        {user.email
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            {
                                                                user.email
                                                            }
                                                        </strong>

                                                        <span>
                                ID #{user.id}
                              </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                          <span className="admin-role">
                            {user.role}
                          </span>
                                            </td>

                                            <td>
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
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    user.createdAt,
                                                )}
                                            </td>

                                            <td>
                                                <div className="admin-table-actions">
                                                    <Link
                                                        to={`/admin/users/${user.id}`}
                                                        className="button button--secondary button--small"
                                                    >
                                                        View
                                                    </Link>

                                                    {user.role ===
                                                    'USER' ? (
                                                        <button
                                                            type="button"
                                                            className={
                                                                user.enabled
                                                                    ? 'button button--danger button--small'
                                                                    : 'button button--secondary button--small'
                                                            }
                                                            disabled={
                                                                updatingUserId ===
                                                                user.id
                                                            }
                                                            onClick={() => {
                                                                if (
                                                                    user.enabled
                                                                ) {
                                                                    setConfirmationUser(
                                                                        user,
                                                                    )
                                                                } else {
                                                                    void updateStatus(
                                                                        user,
                                                                    )
                                                                }
                                                            }}
                                                        >
                                                            {updatingUserId ===
                                                            user.id
                                                                ? 'Saving...'
                                                                : user.enabled
                                                                    ? 'Deactivate'
                                                                    : 'Reactivate'}
                                                        </button>
                                                    ) : (
                                                        <span className="admin-protected-account">
                                Protected
                              </span>
                                                    )}
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
                                    !canGoPrevious
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
                Page {pageLabel}
              </span>

                            <button
                                type="button"
                                className="button button--secondary"
                                disabled={
                                    !canGoNext
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

            {confirmationUser && (
                <div
                    className="admin-dialog-backdrop"
                    onMouseDown={() =>
                        setConfirmationUser(
                            null,
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
                            Deactivate account
                        </p>

                        <h2>
                            Deactivate this user?
                        </h2>

                        <p>
                            {
                                confirmationUser.email
                            }{' '}
                            will lose access to the
                            application. Their active
                            reservations for future
                            screenings will also be
                            cancelled.
                        </p>

                        <div className="admin-dialog__actions">
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() =>
                                    setConfirmationUser(
                                        null,
                                    )
                                }
                            >
                                Keep active
                            </button>

                            <button
                                type="button"
                                className="button button--danger"
                                disabled={
                                    updatingUserId ===
                                    confirmationUser.id
                                }
                                onClick={() =>
                                    void updateStatus(
                                        confirmationUser,
                                    )
                                }
                            >
                                {updatingUserId ===
                                confirmationUser.id
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