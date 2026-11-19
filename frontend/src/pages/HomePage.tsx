import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    useSearchParams,
} from 'react-router-dom'
import { isApiError } from '../api/apiError'
import { MovieCard } from '../components/MovieCard'
import { Pagination } from '../components/Pagination'
import { getMovies } from '../movies/movieApi'
import type {
    Movie,
    PageResponse,
} from '../movies/movieTypes'
import '../styles/movies.css'

function parsePage(
    value: string | null,
) {
    if (!value) {
        return 0
    }

    const parsed = Number.parseInt(
        value,
        10,
    )

    if (
        Number.isNaN(parsed) ||
        parsed < 0
    ) {
        return 0
    }

    return parsed
}

export function HomePage() {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams()

    const search =
        searchParams.get('search') ?? ''

    const page = parsePage(
        searchParams.get('page'),
    )

    const [
        searchValue,
        setSearchValue,
    ] = useState(search)

    const [
        moviesPage,
        setMoviesPage,
    ] =
        useState<PageResponse<Movie> | null>(
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
        reloadKey,
        setReloadKey,
    ] = useState(0)

    const isEmpty =
        moviesPage !== null &&
        moviesPage.content.length === 0

    useEffect(() => {
        setSearchValue(search)
    }, [search])

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadMovies() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getMovies({
                        search,
                        page,
                        size: 12,
                        signal:
                        controller.signal,
                    })

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
        search,
        page,
        reloadKey,
    ])

    function handleSearch(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        const next =
            new URLSearchParams()

        const normalizedSearch =
            searchValue.trim()

        if (normalizedSearch) {
            next.set(
                'search',
                normalizedSearch,
            )
        }

        next.set('page', '0')

        setSearchParams(next)
    }

    function handleClearSearch() {
        setSearchValue('')

        setSearchParams({
            page: '0',
        })
    }

    function handlePageChange(
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

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <section className="page movies-page">
            <div className="movies-hero">
                <p className="eyebrow">
                    RowZero Film Festival
                </p>

                <h1>
                    Discover the programme
                </h1>

                <p>
                    Explore films showing at
                    the festival and find your
                    next screening.
                </p>
            </div>

            <div className="movies-toolbar">
                <form
                    className="movie-search"
                    onSubmit={handleSearch}
                >
                    <div className="movie-search__field">
            <span
                className="movie-search__icon"
                aria-hidden="true"
            >
              ⌕
            </span>

                        <input
                            type="search"
                            value={searchValue}
                            onChange={(event) =>
                                setSearchValue(
                                    event.target.value,
                                )
                            }
                            placeholder="Search movies by title"
                            aria-label="Search movies"
                        />
                    </div>

                    <button
                        type="submit"
                        className="button button--primary"
                    >
                        Search
                    </button>

                    {search && (
                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={
                                handleClearSearch
                            }
                        >
                            Clear
                        </button>
                    )}
                </form>
            </div>

            {!loading &&
                !error &&
                moviesPage &&
                !isEmpty && (
                    <div className="movies-summary">
                        <div>
                            <h2>
                                {search
                                    ? `Results for “${search}”`
                                    : 'All films'}
                            </h2>

                            <p>
                                {moviesPage.totalElements}{' '}
                                {moviesPage.totalElements === 1
                                    ? 'film'
                                    : 'films'}
                            </p>
                        </div>
                    </div>
                )}

            {loading && (
                <div
                    className="movie-grid"
                    aria-label="Loading movies"
                >
                    {Array.from({
                        length: 8,
                    }).map((_, index) => (
                        <div
                            className="movie-card movie-card--skeleton"
                            key={index}
                        >
                            <div className="movie-card__poster skeleton" />

                            <div className="movie-card__body">
                                <div className="skeleton skeleton--small" />
                                <div className="skeleton skeleton--title" />
                                <div className="skeleton skeleton--text" />
                                <div className="skeleton skeleton--text skeleton--short" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && (
                <div className="content-state">
                    <div className="content-state__icon">
                        !
                    </div>

                    <h2>
                        We couldn't load the films
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
                moviesPage &&
                isEmpty && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No films found
                        </h2>

                        <p>
                            {search
                                ? 'Try another title or clear your search.'
                                : 'There are no visible films in the programme yet.'}
                        </p>

                        {search && (
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={
                                    handleClearSearch
                                }
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

            {!loading &&
                !error &&
                moviesPage &&
                !isEmpty && (
                    <>
                        <div className="movie-grid">
                            {moviesPage.content.map(
                                (movie) => (
                                    <MovieCard
                                        key={movie.id}
                                        movie={movie}
                                    />
                                ),
                            )}
                        </div>

                        <Pagination
                            page={page}
                            totalPages={
                                moviesPage.totalPages
                            }
                            onPageChange={
                                handlePageChange
                            }
                        />
                    </>
                )}
        </section>
    )
}