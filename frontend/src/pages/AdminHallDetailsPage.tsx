import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useParams,
} from 'react-router-dom'
import {
    createAdminSeat,
    deleteAdminSeat,
    getAdminHall,
    getAdminSeats,
    updateAdminHall,
    updateAdminSeat,
} from '../admin/adminHallApi'
import type {
    AdminHall,
    AdminSeat,
} from '../admin/adminHallTypes'
import { isApiError } from '../api/apiError'
import '../styles/admin.css'

function parseHallId(
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

export function AdminHallDetailsPage() {
    const { id } = useParams()

    const hallId =
        parseHallId(id)

    const [
        hall,
        setHall,
    ] =
        useState<AdminHall | null>(
            null,
        )

    const [
        seats,
        setSeats,
    ] = useState<AdminSeat[]>([])

    const [
        hallName,
        setHallName,
    ] = useState('')

    const [
        rowLabel,
        setRowLabel,
    ] = useState('')

    const [
        seatNumber,
        setSeatNumber,
    ] = useState('')

    const [
        seatActive,
        setSeatActive,
    ] = useState(true)

    const [
        editingSeat,
        setEditingSeat,
    ] =
        useState<AdminSeat | null>(
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
        action,
        setAction,
    ] =
        useState<string | null>(null)

    const [
        deleteSeat,
        setDeleteSeat,
    ] =
        useState<AdminSeat | null>(
            null,
        )

    const [
        reloadKey,
        setReloadKey,
    ] = useState(0)

    useEffect(() => {
        if (hallId === null) {
            setNotFound(true)
            setLoading(false)
            return
        }

        const currentHallId =
            hallId

        const controller =
            new AbortController()

        async function loadPage() {
            setLoading(true)
            setError(null)
            setNotFound(false)

            try {
                const [
                    hallResponse,
                    seatsResponse,
                ] = await Promise.all([
                    getAdminHall(
                        currentHallId,
                        controller.signal,
                    ),
                    getAdminSeats(
                        currentHallId,
                        controller.signal,
                    ),
                ])

                setHall(hallResponse)
                setHallName(
                    hallResponse.name,
                )

                setSeats(
                    seatsResponse,
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
                        'Unable to load hall.',
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
        hallId,
        reloadKey,
    ])

    const seatRows =
        useMemo(() => {
            const grouped =
                new Map<
                    string,
                    AdminSeat[]
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
                         label,
                         rowSeats,
                     ]) => ({
                        label,
                        seats:
                            [...rowSeats].sort(
                                (
                                    first,
                                    second,
                                ) =>
                                    first.number -
                                    second.number,
                            ),
                    }),
                )
                .sort(
                    (first, second) =>
                        first.label.localeCompare(
                            second.label,
                            undefined,
                            {
                                numeric: true,
                            },
                        ),
                )
        }, [seats])

    async function handleHallUpdate(
        event: FormEvent,
    ) {
        event.preventDefault()

        if (!hall) {
            return
        }

        const trimmed =
            hallName.trim()

        if (!trimmed) {
            return
        }

        setAction('hall')
        setError(null)

        try {
            const response =
                await updateAdminHall(
                    hall.id,
                    trimmed,
                )

            setHall(response)
            setHallName(
                response.name,
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to update hall.',
                )
            }
        } finally {
            setAction(null)
        }
    }

    async function handleCreateSeat(
        event: FormEvent,
    ) {
        event.preventDefault()

        if (!hall) {
            return
        }

        const parsedNumber =
            Number.parseInt(
                seatNumber,
                10,
            )

        if (
            !rowLabel.trim() ||
            Number.isNaN(
                parsedNumber,
            ) ||
            parsedNumber <= 0
        ) {
            return
        }

        setAction('create-seat')
        setError(null)

        try {
            await createAdminSeat(
                hall.id,
                rowLabel.trim(),
                parsedNumber,
                seatActive,
            )

            setRowLabel('')
            setSeatNumber('')
            setSeatActive(true)

            setReloadKey(
                (current) =>
                    current + 1,
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to create seat.',
                )
            }
        } finally {
            setAction(null)
        }
    }

    function startEditing(
        seat: AdminSeat,
    ) {
        setEditingSeat({
            ...seat,
        })

        setError(null)
    }

    async function handleSeatUpdate(
        event: FormEvent,
    ) {
        event.preventDefault()

        if (!editingSeat) {
            return
        }

        setAction('edit-seat')
        setError(null)

        try {
            await updateAdminSeat({
                ...editingSeat,
                rowLabel:
                    editingSeat.rowLabel.trim(),
            })

            setEditingSeat(null)

            setReloadKey(
                (current) =>
                    current + 1,
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to update seat.',
                )
            }
        } finally {
            setAction(null)
        }
    }

    async function handleDeleteSeat() {
        if (!deleteSeat) {
            return
        }

        const currentSeat =
            deleteSeat

        setAction('delete-seat')
        setError(null)

        try {
            await deleteAdminSeat(
                currentSeat.id,
            )

            setDeleteSeat(null)

            setReloadKey(
                (current) =>
                    current + 1,
            )
        } catch (error) {
            setDeleteSeat(null)

            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to delete seat.',
                )
            }
        } finally {
            setAction(null)
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
        !hall
    ) {
        return (
            <section className="admin-page">
                <div className="content-state">
                    <div className="content-state__icon">
                        404
                    </div>

                    <h2>
                        Hall not found
                    </h2>

                    <Link
                        to="/admin/halls"
                        className="button button--primary"
                    >
                        Back to halls
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <section className="admin-page">
            <Link
                to="/admin/halls"
                className="back-link"
            >
                ← Back to halls
            </Link>

            <div className="admin-page-heading admin-page-heading--details">
                <div>
                    <p className="eyebrow">
                        Hall #{hall.id}
                    </p>

                    <h1>
                        {hall.name}
                    </h1>

                    <p>
                        Manage hall information
                        and configure its seat
                        layout.
                    </p>
                </div>

                <div className="admin-total">
                    <strong>
                        {seats.length}
                    </strong>

                    <span>
            seats
          </span>
                </div>
            </div>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            <form
                className="admin-form-card"
                onSubmit={handleHallUpdate}
            >
                <div>
                    <p className="eyebrow">
                        Hall settings
                    </p>

                    <h2>
                        Rename hall
                    </h2>
                </div>

                <div className="admin-form-row">
                    <input
                        type="text"
                        value={hallName}
                        onChange={(event) =>
                            setHallName(
                                event.target.value,
                            )
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="button button--secondary"
                        disabled={
                            action !== null ||
                            !hallName.trim()
                        }
                    >
                        {action === 'hall'
                            ? 'Saving...'
                            : 'Save name'}
                    </button>
                </div>
            </form>

            <div className="admin-seat-layout">
                <div className="admin-seat-layout__heading">
                    <div>
                        <p className="eyebrow">
                            Layout
                        </p>

                        <h2>
                            Seats
                        </h2>
                    </div>
                </div>

                {seats.length === 0 ? (
                    <div className="admin-seat-layout__empty">
                        No seats configured.
                    </div>
                ) : (
                    <div className="admin-seat-map">
                        <div className="admin-seat-screen">
                            SCREEN
                        </div>

                        {seatRows.map(
                            (row) => (
                                <div
                                    className="admin-seat-row"
                                    key={row.label}
                                >
                  <span className="admin-seat-row__label">
                    {row.label}
                  </span>

                                    <div className="admin-seat-row__seats">
                                        {row.seats.map(
                                            (seat) => (
                                                <button
                                                    key={seat.id}
                                                    type="button"
                                                    className={
                                                        seat.active
                                                            ? 'admin-seat admin-seat--active'
                                                            : 'admin-seat admin-seat--inactive'
                                                    }
                                                    onClick={() =>
                                                        startEditing(
                                                            seat,
                                                        )
                                                    }
                                                    title={`Edit ${seat.rowLabel}${seat.number}`}
                                                >
                                                    {
                                                        seat.number
                                                    }
                                                </button>
                                            ),
                                        )}
                                    </div>

                                    <span className="admin-seat-row__label">
                    {row.label}
                  </span>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </div>

            <form
                className="admin-form-card"
                onSubmit={
                    handleCreateSeat
                }
            >
                <div>
                    <p className="eyebrow">
                        New seat
                    </p>

                    <h2>
                        Add seat
                    </h2>

                    <p>
                        Each seat is added
                        individually to the hall.
                    </p>
                </div>

                <div className="admin-seat-form">
                    <label>
                        <span>Row</span>

                        <input
                            type="text"
                            value={rowLabel}
                            placeholder="A"
                            maxLength={10}
                            onChange={(event) =>
                                setRowLabel(
                                    event.target.value,
                                )
                            }
                            required
                        />
                    </label>

                    <label>
                        <span>Number</span>

                        <input
                            type="number"
                            min="1"
                            value={seatNumber}
                            placeholder="1"
                            onChange={(event) =>
                                setSeatNumber(
                                    event.target.value,
                                )
                            }
                            required
                        />
                    </label>

                    <label className="admin-checkbox">
                        <input
                            type="checkbox"
                            checked={seatActive}
                            onChange={(event) =>
                                setSeatActive(
                                    event.target
                                        .checked,
                                )
                            }
                        />

                        <span>
              Active
            </span>
                    </label>

                    <button
                        type="submit"
                        className="button button--primary"
                        disabled={
                            action !== null
                        }
                    >
                        {action ===
                        'create-seat'
                            ? 'Adding...'
                            : 'Add seat'}
                    </button>
                </div>
            </form>

            <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Seat</th>
                        <th>Row</th>
                        <th>Number</th>
                        <th>Status</th>
                        <th />
                    </tr>
                    </thead>

                    <tbody>
                    {seats
                        .slice()
                        .sort(
                            (first, second) =>
                                first.rowLabel.localeCompare(
                                    second.rowLabel,
                                    undefined,
                                    {
                                        numeric: true,
                                    },
                                ) ||
                                first.number -
                                second.number,
                        )
                        .map(
                            (seat) => (
                                <tr key={seat.id}>
                                    <td>
                                        <strong className="admin-hall-name">
                                            {
                                                seat.rowLabel
                                            }
                                            {seat.number}
                                        </strong>
                                    </td>

                                    <td>
                                        {
                                            seat.rowLabel
                                        }
                                    </td>

                                    <td>
                                        {seat.number}
                                    </td>

                                    <td>
                      <span
                          className={
                              seat.active
                                  ? 'admin-status admin-status--active'
                                  : 'admin-status admin-status--disabled'
                          }
                      >
                        {seat.active
                            ? 'Active'
                            : 'Inactive'}
                      </span>
                                    </td>

                                    <td>
                                        <div className="admin-table-actions">
                                            <button
                                                type="button"
                                                className="button button--secondary button--small"
                                                onClick={() =>
                                                    startEditing(
                                                        seat,
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                className="button button--danger button--small"
                                                onClick={() =>
                                                    setDeleteSeat(
                                                        seat,
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

            {editingSeat && (
                <div
                    className="admin-dialog-backdrop"
                    onMouseDown={() =>
                        setEditingSeat(null)
                    }
                >
                    <form
                        className="admin-dialog"
                        onSubmit={
                            handleSeatUpdate
                        }
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <p className="eyebrow">
                            Seat #{editingSeat.id}
                        </p>

                        <h2>
                            Edit seat
                        </h2>

                        <div className="admin-dialog-fields">
                            <label>
                                <span>Row</span>

                                <input
                                    type="text"
                                    value={
                                        editingSeat.rowLabel
                                    }
                                    onChange={(event) =>
                                        setEditingSeat({
                                            ...editingSeat,
                                            rowLabel:
                                            event.target
                                                .value,
                                        })
                                    }
                                    required
                                />
                            </label>

                            <label>
                                <span>Number</span>

                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        editingSeat.number
                                    }
                                    onChange={(event) =>
                                        setEditingSeat({
                                            ...editingSeat,
                                            number:
                                                Number.parseInt(
                                                    event.target
                                                        .value,
                                                    10,
                                                ) || 0,
                                        })
                                    }
                                    required
                                />
                            </label>

                            <label className="admin-checkbox">
                                <input
                                    type="checkbox"
                                    checked={
                                        editingSeat.active
                                    }
                                    onChange={(event) =>
                                        setEditingSeat({
                                            ...editingSeat,
                                            active:
                                            event.target
                                                .checked,
                                        })
                                    }
                                />

                                <span>
                  Active
                </span>
                            </label>
                        </div>

                        <div className="admin-dialog__actions">
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() =>
                                    setEditingSeat(
                                        null,
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="button button--primary"
                                disabled={
                                    action ===
                                    'edit-seat'
                                }
                            >
                                {action ===
                                'edit-seat'
                                    ? 'Saving...'
                                    : 'Save seat'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {deleteSeat && (
                <div
                    className="admin-dialog-backdrop"
                    onMouseDown={() =>
                        setDeleteSeat(null)
                    }
                >
                    <div
                        className="admin-dialog"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <p className="eyebrow">
                            Delete seat
                        </p>

                        <h2>
                            Delete{' '}
                            {deleteSeat.rowLabel}
                            {deleteSeat.number}?
                        </h2>

                        <p>
                            The backend will reject
                            this operation if the
                            seat is already used by
                            screening data.
                        </p>

                        <div className="admin-dialog__actions">
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={() =>
                                    setDeleteSeat(null)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="button button--danger"
                                disabled={
                                    action ===
                                    'delete-seat'
                                }
                                onClick={() =>
                                    void handleDeleteSeat()
                                }
                            >
                                {action ===
                                'delete-seat'
                                    ? 'Deleting...'
                                    : 'Delete seat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}