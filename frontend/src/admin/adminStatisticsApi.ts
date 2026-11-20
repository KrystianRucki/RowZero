import { apiRequest } from '../api/apiClient'
import type {
    ScreeningOccupancy,
} from './adminStatisticsTypes'

export function getAdminOccupancy(
    date?: string,
    signal?: AbortSignal,
) {
    const searchParams =
        new URLSearchParams()

    if (date) {
        searchParams.set(
            'date',
            date,
        )
    }

    const query =
        searchParams.toString()

    return apiRequest<
        ScreeningOccupancy[]
    >(
        `/api/admin/statistics/occupancy${query ? `?${query}` : ''}`,
        {
            signal,
        },
    )
}