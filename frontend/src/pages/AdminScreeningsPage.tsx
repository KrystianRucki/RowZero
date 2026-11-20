import {
    useEffect,
    useState,
} from 'react'
import {
    Link,
    useSearchParams,
} from 'react-router-dom'
import { getAdminScreenings } from '../admin/adminScreeningApi'
import type {
    AdminScreeningsPage,
} from '../admin/adminScreeningTypes'
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

export function AdminScreeningsPage() {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams()

    const page =
        parsePage(
            searchParams.get('page'),
        )

    const [
        screeningsPage,
        setScreeningsPage,
    ] =
        useState<AdminScreeningsPage | null>(
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
        const controller =
            new AbortController()

        async function loadScreenings() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getAdminScreenings(
                        page,
                        10,
                        controller.signal,
                    )

                setScreeningsPage(
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
                        'Unable to load screenings.',
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

        void loadScreenings()

        return () => {
            controller.abort()
        }
    }, [page])

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

    const screenings =
        screeningsPage?.content ?? []

    const totalPages =
        screeningsPage?.totalPages ?? 0

    return (
        <section className="admin-page">
            <div className="admin-page-heading">
                <div>
                    <p className="eyebrow">
                        Programme
                    </p>

                    <h1>
                        Screenings
                    </h1>

                    <p>
                        Manage the festival
                        schedule, screening times
                        and assigned halls.
                    </p>
                </div>

                <Link
                    to="/admin/screenings/new"
                    className="button button--primary"
                >
                    Add screening
                </Link>
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
                screenings.length === 0 && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No screenings
                        </h2>

                        <p>
                            Create the first
                            screening for the
                            festival programme.
                        </p>

                        <Link
                            to="/admin/screenings/new"
                            className="button button--primary"
                        >
                            Add screening
                        </Link>
                    </div>
                )}

            {!loading &&
                screenings.length > 0 && (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Movie</th>
                                    <th>Hall</th>
                                    <th>Start</th>
                                    <th>End</th>
                                    <th>Status</th>
                                    <th />
                                </tr>
                                </thead>

                                <tbody>
                                {screenings.map(
                                    (screening) => (
                                        <tr
                                            key={
                                                screening.id
                                            }
                                        >
                                            <td>
                                                <div className="admin-screening-title">
                                                    <strong>
                                                        {
                                                            screening.movieTitle
                                                        }
                                                    </strong>

                                                    <span>
                              Screening #
                                                        {
                                                            screening.id
                                                        }
                            </span>
                                                </div>
                                            </td>

                                            <td>
                                                {
                                                    screening.hallName
                                                }
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    screening.startAt,
                                                )}
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    screening.endAt,
                                                )}
                                            </td>

                                            <td>
                          <span
                              className={
                                  screening.status ===
                                  'SCHEDULED'
                                      ? 'admin-status admin-status--active'
                                      : 'admin-status admin-status--disabled'
                              }
                          >
                            {
                                screening.status
                            }
                          </span>
                                            </td>

                                            <td>
                                                <div className="admin-table-actions">
                                                    <Link
                                                        to={`/admin/screenings/${screening.id}`}
                                                        className="button button--secondary button--small"
                                                    >
                                                        Manage
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
                                disabled={page === 0}
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