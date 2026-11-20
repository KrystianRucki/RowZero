import {
    useEffect,
    useState,
    type FormEvent,
} from 'react'
import {
    useSearchParams,
} from 'react-router-dom'
import { isApiError } from '../api/apiError'
import { Pagination } from '../components/Pagination'
import { ScreeningCard } from '../components/ScreeningCard'
import { getMovies } from '../movies/movieApi'
import type { Movie } from '../movies/movieTypes'
import { getScreenings } from '../screenings/screeningApi'
import type { Screening } from '../screenings/screeningTypes'
import type { PageResponse } from '../movies/movieTypes'
import '../styles/schedule.css'

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

function parseOptionalId(
    value: string | null,
) {
    if (!value) {
        return null
    }

    const parsed = Number.parseInt(
        value,
        10,
    )

    if (
        Number.isNaN(parsed) ||
        parsed <= 0
    ) {
        return null
    }

    return parsed
}

export function SchedulePage() {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams()

    const date =
        searchParams.get('date') ?? ''

    const movieId =
        parseOptionalId(
            searchParams.get('movieId'),
        )

    const page =
        parsePage(
            searchParams.get('page'),
        )

    const [
        draftDate,
        setDraftDate,
    ] = useState(date)

    const [
        draftMovieId,
        setDraftMovieId,
    ] = useState(
        movieId
            ? String(movieId)
            : '',
    )

    const [
        movieOptions,
        setMovieOptions,
    ] = useState<Movie[]>([])

    const [
        screeningsPage,
        setScreeningsPage,
    ] =
        useState<
            PageResponse<Screening> | null
        >(null)

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
        setDraftDate(date)

        setDraftMovieId(
            movieId
                ? String(movieId)
                : '',
        )
    }, [
        date,
        movieId,
    ])

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadMovies() {
            try {
                const response =
                    await getMovies({
                        page: 0,
                        size: 100,
                        signal:
                        controller.signal,
                    })

                setMovieOptions(
                    response.content,
                )
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name === 'AbortError'
                ) {
                    return
                }
            }
        }

        void loadMovies()

        return () => {
            controller.abort()
        }
    }, [])

    useEffect(() => {
        const controller =
            new AbortController()

        async function loadScreenings() {
            setLoading(true)
            setError(null)

            try {
                const response =
                    await getScreenings({
                        date:
                            date || undefined,
                        movieId:
                            movieId ?? undefined,
                        page,
                        size: 12,
                        signal:
                        controller.signal,
                    })

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
                        'Unable to load the schedule.',
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
    }, [
        date,
        movieId,
        page,
        reloadKey,
    ])

    function handleSubmit(
        event:
        FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        const next =
            new URLSearchParams()

        if (draftDate) {
            next.set(
                'date',
                draftDate,
            )
        }

        if (draftMovieId) {
            next.set(
                'movieId',
                draftMovieId,
            )
        }

        next.set('page', '0')

        setSearchParams(next)
    }

    function handleClear() {
        setDraftDate('')
        setDraftMovieId('')

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

    const isEmpty =
        screeningsPage !== null &&
        screeningsPage.content.length === 0

    const hasFilters =
        Boolean(date) ||
        movieId !== null

    return (
        <section className="page schedule-page">
            <div className="schedule-hero">
                <p className="eyebrow">
                    Festival programme
                </p>

                <h1>Schedule</h1>

                <p>
                    Browse upcoming screenings,
                    choose a film and find a seat
                    that works for you.
                </p>
            </div>

            <form
                className="schedule-filters"
                onSubmit={handleSubmit}
            >
                <div className="schedule-filter">
                    <label htmlFor="schedule-date">
                        Date
                    </label>

                    <input
                        id="schedule-date"
                        type="date"
                        value={draftDate}
                        onChange={(event) =>
                            setDraftDate(
                                event.target.value,
                            )
                        }
                    />
                </div>

                <div className="schedule-filter schedule-filter--movie">
                    <label htmlFor="schedule-movie">
                        Film
                    </label>

                    <select
                        id="schedule-movie"
                        value={draftMovieId}
                        onChange={(event) =>
                            setDraftMovieId(
                                event.target.value,
                            )
                        }
                    >
                        <option value="">
                            All films
                        </option>

                        {movieOptions.map(
                            (movie) => (
                                <option
                                    key={movie.id}
                                    value={movie.id}
                                >
                                    {movie.title}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <div className="schedule-filters__actions">
                    <button
                        type="submit"
                        className="button button--primary"
                    >
                        Apply filters
                    </button>

                    {hasFilters && (
                        <button
                            type="button"
                            className="button button--secondary"
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {loading && (
                <div className="schedule-list">
                    {Array.from({
                        length: 6,
                    }).map((_, index) => (
                        <div
                            key={index}
                            className="schedule-skeleton skeleton"
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
                        We couldn't load the schedule
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
                screeningsPage &&
                isEmpty && (
                    <div className="content-state">
                        <div className="content-state__icon">
                            ◇
                        </div>

                        <h2>
                            No screenings found
                        </h2>

                        <p>
                            {hasFilters
                                ? 'No screenings match the selected filters.'
                                : 'There are no upcoming screenings in the programme.'}
                        </p>

                        {hasFilters && (
                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={
                                    handleClear
                                }
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

            {!loading &&
                !error &&
                screeningsPage &&
                !isEmpty && (
                    <>
                        <div className="schedule-summary">
                            <div>
                                <h2>
                                    Upcoming screenings
                                </h2>

                                <p>
                                    {
                                        screeningsPage.totalElements
                                    }{' '}
                                    {screeningsPage.totalElements ===
                                    1
                                        ? 'screening'
                                        : 'screenings'}
                                </p>
                            </div>
                        </div>

                        <div className="schedule-list">
                            {screeningsPage.content.map(
                                (screening) => (
                                    <ScreeningCard
                                        key={
                                            screening.id
                                        }
                                        screening={
                                            screening
                                        }
                                        showMovieTitle
                                    />
                                ),
                            )}
                        </div>

                        <Pagination
                            page={page}
                            totalPages={
                                screeningsPage.totalPages
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