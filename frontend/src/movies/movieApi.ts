import { apiRequest } from '../api/apiClient'
import type {
    Movie,
    PageResponse,
} from './movieTypes'

type GetMoviesParams = {
    search?: string
    page?: number
    size?: number
    signal?: AbortSignal
}

export function getMovies({
                              search = '',
                              page = 0,
                              size = 12,
                              signal,
                          }: GetMoviesParams) {
    const params = new URLSearchParams()

    params.set('page', String(page))
    params.set('size', String(size))

    const normalizedSearch = search.trim()

    if (normalizedSearch) {
        params.set(
            'search',
            normalizedSearch,
        )
    }

    return apiRequest<PageResponse<Movie>>(
        `/api/movies?${params.toString()}`,
        {
            signal,
        },
    )
}