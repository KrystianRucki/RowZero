import { apiRequest } from '../api/apiClient'
import type {
    AdminMovie,
    AdminMoviesPage,
    TmdbMovieSearchResponse,
} from './adminMovieTypes'

type GetAdminMoviesParams = {
    search?: string
    visible?: boolean
    page: number
    size: number
}

export function getAdminMovies(
    params: GetAdminMoviesParams,
    signal?: AbortSignal,
) {
    const searchParams =
        new URLSearchParams()

    if (params.search) {
        searchParams.set(
            'search',
            params.search,
        )
    }

    if (
        params.visible !==
        undefined
    ) {
        searchParams.set(
            'visible',
            String(params.visible),
        )
    }

    searchParams.set(
        'page',
        String(params.page),
    )

    searchParams.set(
        'size',
        String(params.size),
    )

    return apiRequest<AdminMoviesPage>(
        `/api/admin/movies?${searchParams.toString()}`,
        {
            signal,
        },
    )
}

export function getAdminMovie(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<AdminMovie>(
        `/api/admin/movies/${id}`,
        {
            signal,
        },
    )
}

export function updateAdminMovieVisibility(
    movie: AdminMovie,
    visible: boolean,
) {
    return apiRequest<AdminMovie>(
        `/api/admin/movies/${movie.id}`,
        {
            method: 'PUT',
            body: JSON.stringify({
                title: movie.title,
                originalTitle:
                movie.originalTitle,
                overview:
                movie.overview,
                runtime:
                movie.runtime,
                releaseDate:
                movie.releaseDate,
                posterPath:
                movie.posterPath,
                backdropPath:
                movie.backdropPath,
                visible,
            }),
        },
    )
}

export function refreshAdminMovie(
    id: number,
) {
    return apiRequest<AdminMovie>(
        `/api/admin/movies/${id}/refresh`,
        {
            method: 'POST',
        },
    )
}

export function deleteAdminMovie(
    id: number,
) {
    return apiRequest<void>(
        `/api/admin/movies/${id}`,
        {
            method: 'DELETE',
        },
    )
}

export function searchTmdbMovies(
    query: string,
    page = 1,
    signal?: AbortSignal,
) {
    const searchParams =
        new URLSearchParams()

    searchParams.set(
        'query',
        query,
    )

    searchParams.set(
        'page',
        String(page),
    )

    return apiRequest<TmdbMovieSearchResponse>(
        `/api/admin/tmdb/movies/search?${searchParams.toString()}`,
        {
            signal,
        },
    )
}

export function importTmdbMovie(
    tmdbId: number,
) {
    return apiRequest<AdminMovie>(
        `/api/admin/movies/import/${tmdbId}`,
        {
            method: 'POST',
        },
    )
}