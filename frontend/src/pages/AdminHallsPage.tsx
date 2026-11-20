import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import {
    createAdminHall,
    deleteAdminHall,
    getAdminHalls,
} from '../admin/adminHallApi'
import type { AdminHall } from '../admin/adminHallTypes'
import { isApiError } from '../api/apiError'
import '../styles/admin.css'

export function AdminHallsPage() {
    const [
        halls,
        setHalls,
    ] = useState<AdminHall[]>([])

    const [
        name,
        setName,
    ] = useState('')

    const [
        loading,
        setLoading,
    ] = useState(true)

    const [
        creating,
        setCreating,
    ] = useState(false)

    const [
        error,
        setError,
    ] = useState<string | null>(null)

    const [
        deleteHall,
        setDeleteHall,
    ] =
        useState<AdminHall | null>(
            null,
        )

    const [
        deletingId,
        setDeletingId,
    ] =
        useState<number | null>(null)

    const [
        reloadKey,
        setReloadKey,
    ] = useState(0)

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadHalls() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getAdminHalls(
                        controller.signal,
                    )

                setHalls(
                    [...response].sort(
                        (first, second) =>
                            first.name.localeCompare(
                                second.name,
                            ),
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
                        'Unable to load halls.',
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

        void loadHalls()

        return () => {
            controller.abort()
        }
    }, [reloadKey])

    async function handleCreate(
        event: FormEvent,
    ) {
        event.preventDefault()

        const trimmed =
            name.trim()

        if (!trimmed) {
            return
        }

        setCreating(true)
        setError(null)

        try {
            await createAdminHall(
                trimmed,
            )

            setName('')

            setReloadKey(
                (current) =>
                    current + 1,
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to create hall.',
                )
            }
        } finally {
            setCreating(false)
        }
    }

    async function handleDelete() {
        if (!deleteHall) {
            return
        }

        const currentHall =
            deleteHall

        setDeletingId(
            currentHall.id,
        )

        setError(null)

        try {
            await deleteAdminHall(
                currentHall.id,
            )

            setDeleteHall(null)

            setReloadKey(
                (current) =>
                    current + 1,
            )
        } catch (error) {
            setDeleteHall(null)

            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to delete hall.',
                )
            }
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <section className="admin-page">
            <div className="admin-page-heading">
                <div>
                    <p className="eyebrow">
                        Venue
                    </p>

                    <h1>
                        Halls & seats
                    </h1>

                    <p>
                        Manage screening halls
                        and their seat layouts.
                    </p>
                </div>
            </div>

            <form
                className="admin-create-panel"
                onSubmit={handleCreate}
            >
                <div>
                    <p className="eyebrow">
                        New hall
                    </p>

                    <h2>
                        Add screening hall
                    </h2>
                </div>

                <div className="admin-create-panel__form">
                    <input
                        type="text"
                        value={name}
                        placeholder="Hall name"
                        onChange={(event) =>
                            setName(
                                event.target.value,
                            )
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="button button--primary"
                        disabled={
                            creating ||
                            !name.trim()
                        }
                    >
                        {creating
                            ? 'Creating...'
                            : 'Add hall'}
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
                        length: 4,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="skeleton admin-table-skeleton"
                        />
                    ))}
                </div>
            )}

            {!loading &&
                halls.length === 0 && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No halls yet
                        </h2>

                        <p>
                            Create the first
                            screening hall to start
                            configuring seats.
                        </p>
                    </div>
                )}

            {!loading &&
                halls.length > 0 && (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>Hall</th>
                                <th>ID</th>
                                <th />
                            </tr>
                            </thead>

                            <tbody>
                            {halls.map(
                                (hall) => (
                                    <tr key={hall.id}>
                                        <td>
                                            <strong className="admin-hall-name">
                                                {hall.name}
                                            </strong>
                                        </td>

                                        <td>
                                            #{hall.id}
                                        </td>

                                        <td>
                                            <div className="admin-table-actions">
                                                <Link
                                                    to={`/admin/halls/${hall.id}`}
                                                    className="button button--secondary button--small"
                                                >
                                                    Manage
                                                </Link>

                                                <button
                                                    type="button"
                                                    className="button button--danger button--small"
                                                    onClick={() =>
                                                        setDeleteHall(
                                                            hall,
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ),
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

            {deleteHall && (
                <div
                    className="admin-dialog-backdrop"
                    onMouseDown={() =>
                        setDeleteHall(null)
                    }
                >
                    <div
                        className="admin-dialog"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <p className="eyebrow">
                            Delete hall
                        </p>

                        <h2>
                            Delete{' '}
                            {deleteHall.name}?
                        </h2>

                        <p>
                            The operation will be
                            rejected if this hall is
                            already referenced by
                            screening data.
                        </p>

                        <div className="admin-dialog__actions">
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() =>
                                    setDeleteHall(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button--danger"
                                disabled={
                                    deletingId ===
                                    deleteHall.id
                                }
                                onClick={() =>
                                    void handleDelete()
                                }
                            >
                                {deletingId ===
                                deleteHall.id
                                    ? 'Deleting...'
                                    : 'Delete hall'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}