import { apiRequest } from '../api/apiClient'
import type { PageResponse } from '../movies/movieTypes'
import type { Screening } from './screeningTypes'

type GetScreeningsParams = {
    movieId: number
    page?: number
    size?: number
    signal?: AbortSignal
}

export function getScreenings({
                                  movieId,
                                  page = 0,
                                  size = 50,
                                  signal,
                              }: GetScreeningsParams) {
    const params = new URLSearchParams()

    params.set(
        'movieId',
        String(movieId),
    )

    params.set(
        'page',
        String(page),
    )

    params.set(
        'size',
        String(size),
    )

    return apiRequest<
        PageResponse<Screening>
    >(
        `/api/screenings?${params.toString()}`,
        {
            signal,
        },
    )
}