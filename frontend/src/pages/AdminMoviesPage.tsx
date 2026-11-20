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
    getAdminMovies,
    updateAdminMovieVisibility,
} from '../admin/adminMovieApi'
import type {
    AdminMovie,
    AdminMoviesPage,
} from '../admin/adminMovieTypes'
import { isApiError } from '../api/apiError'
import { getTmdbPosterUrl } from '../utils/tmdbImage'
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

export function AdminMoviesPage() {
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

    const visibility =
        searchParams.get(
            'visibility',
        ) ?? 'all'

    const [
        searchInput,
        setSearchInput,
    ] = useState(search)

    const [
        moviesPage,
        setMoviesPage,
    ] =
        useState<AdminMoviesPage | null>(
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
        updatingId,
        setUpdatingId,
    ] =
        useState<number | null>(null)

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

        let visible:
            | boolean
            | undefined

        if (
            visibility === 'visible'
        ) {
            visible = true
        }

        if (
            visibility === 'hidden'
        ) {
            visible = false
        }

        async function loadMovies() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getAdminMovies(
                        {
                            search:
                                search ||
                                undefined,
                            visible,
                            page,
                            size: 10,
                        },
                        controller.signal,
                    )

                setMoviesPage(response)
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
                        'Unable to load movies.',
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

        void loadMovies()

        return () => {
            controller.abort()
        }
    }, [
        page,
        search,
        visibility,
        reloadKey,
    ])

    function handleSearch(
        event: FormEvent,
    ) {
        event.preventDefault()

        const next =
            new URLSearchParams(
                searchParams,
            )

        const value =
            searchInput.trim()

        if (value) {
            next.set(
                'search',
                value,
            )
        } else {
            next.delete('search')
        }

        next.set('page', '0')

        setSearchParams(next)
    }

    function changeVisibility(
        value: string,
    ) {
        const next =
            new URLSearchParams(
                searchParams,
            )

        if (value === 'all') {
            next.delete(
                'visibility',
            )
        } else {
            next.set(
                'visibility',
                value,
            )
        }

        next.set('page', '0')

        setSearchParams(next)
    }

    function changePage(
        newPage: number,
    ) {
        const next =
            new URLSearchParams(
                searchParams,
            )

        next.set(
            'page',
            String(newPage),
        )

        setSearchParams(next)
    }

    async function toggleVisibility(
        movie: AdminMovie,
    ) {
        setUpdatingId(movie.id)
        setError(null)

        try {
            await updateAdminMovieVisibility(
                movie,
                !movie.visible,
            )

            setReloadKey(
                (current) =>
                    current + 1,
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to update movie visibility.',
                )
            }
        } finally {
            setUpdatingId(null)
        }
    }

    const movies =
        moviesPage?.content ?? []

    const totalPages =
        moviesPage?.totalPages ?? 0

    return (
        <section className="admin-page">
            <div className="admin-page-heading">
                <div>
                    <p className="eyebrow">
                        Catalogue
                    </p>

                    <h1>
                        Movies
                    </h1>

                    <p>
                        Manage imported films,
                        catalogue visibility and
                        TMDB synchronization.
                    </p>
                </div>

                <Link
                    to="/admin/movies/import"
                    className="button button--primary"
                >
                    Import from TMDB
                </Link>
            </div>

            <div className="admin-toolbar">
                <form
                    className="admin-search"
                    onSubmit={handleSearch}
                >
                    <input
                        type="search"
                        placeholder="Search movies"
                        value={searchInput}
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
                    value={visibility}
                    onChange={(event) =>
                        changeVisibility(
                            event.target.value,
                        )
                    }
                >
                    <option value="all">
                        All movies
                    </option>

                    <option value="visible">
                        Visible
                    </option>

                    <option value="hidden">
                        Hidden
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
                movies.length === 0 && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No movies found
                        </h2>

                        <p>
                            Import a film from TMDB
                            or change the current
                            filters.
                        </p>

                        <Link
                            to="/admin/movies/import"
                            className="button button--primary"
                        >
                            Import movie
                        </Link>
                    </div>
                )}

            {!loading &&
                movies.length > 0 && (
                    <>
                        <div className="admin-table-wrapper">
                            <table className="admin-table">
                                <thead>
                                <tr>
                                    <th>Movie</th>
                                    <th>TMDB ID</th>
                                    <th>Runtime</th>
                                    <th>Release</th>
                                    <th>Visibility</th>
                                    <th />
                                </tr>
                                </thead>

                                <tbody>
                                {movies.map(
                                    (movie) => {
                                        const posterUrl =
                                            getTmdbPosterUrl(
                                                movie.posterPath,
                                            )

                                        return (
                                            <tr
                                                key={
                                                    movie.id
                                                }
                                            >
                                                <td>
                                                    <div className="admin-movie-cell">
                                                        <div className="admin-movie-poster">
                                                            {posterUrl ? (
                                                                <img
                                                                    src={
                                                                        posterUrl
                                                                    }
                                                                    alt=""
                                                                />
                                                            ) : (
                                                                <span>
                                    No poster
                                  </span>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    movie.title
                                                                }
                                                            </strong>

                                                            <span>
                                  ID #
                                                                {movie.id}
                                </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    {
                                                        movie.tmdbId
                                                    }
                                                </td>

                                                <td>
                                                    {movie.runtime
                                                        ? `${movie.runtime} min`
                                                        : '—'}
                                                </td>

                                                <td>
                                                    {movie.releaseDate ??
                                                        '—'}
                                                </td>

                                                <td>
                            <span
                                className={
                                    movie.visible
                                        ? 'admin-status admin-status--active'
                                        : 'admin-status admin-status--disabled'
                                }
                            >
                              {movie.visible
                                  ? 'Visible'
                                  : 'Hidden'}
                            </span>
                                                </td>

                                                <td>
                                                    <div className="admin-table-actions">
                                                        <Link
                                                            to={`/admin/movies/${movie.id}`}
                                                            className="button button--secondary button--small"
                                                        >
                                                            View
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            className="button button--secondary button--small"
                                                            disabled={
                                                                updatingId ===
                                                                movie.id
                                                            }
                                                            onClick={() =>
                                                                void toggleVisibility(
                                                                    movie,
                                                                )
                                                            }
                                                        >
                                                            {updatingId ===
                                                            movie.id
                                                                ? 'Saving...'
                                                                : movie.visible
                                                                    ? 'Hide'
                                                                    : 'Show'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    },
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
                                {totalPages === 0
                                    ? 0
                                    : page + 1}{' '}
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