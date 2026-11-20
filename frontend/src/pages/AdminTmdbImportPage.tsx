import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useNavigate,
} from 'react-router-dom'
import {
    importTmdbMovie,
    searchTmdbMovies,
} from '../admin/adminMovieApi'
import type {
    TmdbMovieSearchResponse,
    TmdbMovieSearchResult,
} from '../admin/adminMovieTypes'
import { isApiError } from '../api/apiError'
import { getTmdbPosterUrl } from '../utils/tmdbImage'
import '../styles/admin.css'

function normalizeResults(
    response: TmdbMovieSearchResponse,
) {
    if (Array.isArray(response)) {
        return response
    }

    if (
        Array.isArray(
            response.content,
        )
    ) {
        return response.content
    }

    if (
        Array.isArray(
            response.results,
        )
    ) {
        return response.results
    }

    return []
}

export function AdminTmdbImportPage() {
    const navigate = useNavigate()

    const [
        query,
        setQuery,
    ] = useState('')

    const [
        submittedQuery,
        setSubmittedQuery,
    ] = useState('')

    const [
        results,
        setResults,
    ] =
        useState<
            TmdbMovieSearchResult[]
        >([])

    const [
        loading,
        setLoading,
    ] = useState(false)

    const [
        error,
        setError,
    ] =
        useState<string | null>(null)

    const [
        importingId,
        setImportingId,
    ] =
        useState<number | null>(null)

    useEffect(() => {
        if (!submittedQuery) {
            return
        }

        const controller =
            new AbortController()

        async function loadResults() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await searchTmdbMovies(
                        submittedQuery,
                        1,
                        controller.signal,
                    )

                setResults(
                    normalizeResults(
                        response,
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
                        'Unable to search TMDB.',
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

        void loadResults()

        return () => {
            controller.abort()
        }
    }, [submittedQuery])

    function handleSearch(
        event: FormEvent,
    ) {
        event.preventDefault()

        const trimmed =
            query.trim()

        if (!trimmed) {
            return
        }

        setSubmittedQuery(
            trimmed,
        )
    }

    async function handleImport(
        movie: TmdbMovieSearchResult,
    ) {
        setImportingId(
            movie.tmdbId,
        )

        setError(null)

        try {
            const imported =
                await importTmdbMovie(
                    movie.tmdbId,
                )

            navigate(
                `/admin/movies/${imported.id}`,
            )
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to import movie.',
                )
            }
        } finally {
            setImportingId(null)
        }
    }

    return (
        <section className="admin-page">
            <Link
                to="/admin/movies"
                className="back-link"
            >
                ← Back to movies
            </Link>

            <div className="admin-page-heading admin-page-heading--details">
                <div>
                    <p className="eyebrow">
                        TMDB
                    </p>

                    <h1>
                        Import movie
                    </h1>

                    <p>
                        Search The Movie Database
                        and import a film into
                        RowZero.
                    </p>
                </div>
            </div>

            <form
                className="admin-tmdb-search"
                onSubmit={handleSearch}
            >
                <input
                    type="search"
                    placeholder="Search for a movie"
                    value={query}
                    onChange={(event) =>
                        setQuery(
                            event.target.value,
                        )
                    }
                />

                <button
                    type="submit"
                    className="button button--primary"
                    disabled={
                        loading ||
                        !query.trim()
                    }
                >
                    {loading
                        ? 'Searching...'
                        : 'Search TMDB'}
                </button>
            </form>

            {error && (
                <div className="admin-error">
                    {error}
                </div>
            )}

            {!loading &&
                submittedQuery &&
                results.length === 0 &&
                !error && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No results
                        </h2>

                        <p>
                            No TMDB movies matched
                            your search.
                        </p>
                    </div>
                )}

            {results.length > 0 && (
                <div className="admin-tmdb-results">
                    {results.map(
                        (movie) => {
                            const posterUrl =
                                getTmdbPosterUrl(
                                    movie.posterPath,
                                    'w342',
                                )

                            return (
                                <article
                                    key={
                                        movie.tmdbId
                                    }
                                    className="admin-tmdb-card"
                                >
                                    <div className="admin-tmdb-card__poster">
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

                                    <div className="admin-tmdb-card__content">
                                        <div>
                      <span className="admin-tmdb-card__id">
                        TMDB #
                          {
                              movie.tmdbId
                          }
                      </span>

                                            <h2>
                                                {
                                                    movie.title
                                                }
                                            </h2>

                                            {movie.releaseDate && (
                                                <span className="admin-tmdb-card__date">
                          {
                              movie.releaseDate
                          }
                        </span>
                                            )}
                                        </div>

                                        <p>
                                            {movie.overview ||
                                                'No overview available.'}
                                        </p>

                                        <button
                                            type="button"
                                            className="button button--primary"
                                            disabled={
                                                importingId !==
                                                null
                                            }
                                            onClick={() =>
                                                void handleImport(
                                                    movie,
                                                )
                                            }
                                        >
                                            {importingId ===
                                            movie.tmdbId
                                                ? 'Importing...'
                                                : 'Import movie'}
                                        </button>
                                    </div>
                                </article>
                            )
                        },
                    )}
                </div>
            )}
        </section>
    )
}