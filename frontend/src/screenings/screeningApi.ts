import { apiRequest } from '../api/apiClient'
import type { PageResponse } from '../movies/movieTypes'
import type {
    Screening,
    ScreeningSeat,
} from './screeningTypes'

type GetScreeningsParams = {
    date?: string
    movieId?: number
    hallId?: number
    page?: number
    size?: number
    signal?: AbortSignal
}

export function getScreenings({
                                  date,
                                  movieId,
                                  hallId,
                                  page = 0,
                                  size = 12,
                                  signal,
                              }: GetScreeningsParams = {}) {
    const params = new URLSearchParams()

    params.set(
        'page',
        String(page),
    )

    params.set(
        'size',
        String(size),
    )

    if (date) {
        params.set('date', date)
    }

    if (movieId) {
        params.set(
            'movieId',
            String(movieId),
        )
    }

    if (hallId) {
        params.set(
            'hallId',
            String(hallId),
        )
    }

    return apiRequest<
        PageResponse<Screening>
    >(
        `/api/screenings?${params.toString()}`,
        {
            signal,
        },
    )
}

export function getScreening(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<Screening>(
        `/api/screenings/${id}`,
        {
            signal,
        },
    )
}

export function getScreeningSeats(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<ScreeningSeat[]>(
        `/api/screenings/${id}/seats`,
        {
            signal,
        },
    )
}