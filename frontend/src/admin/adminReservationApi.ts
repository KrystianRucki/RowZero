import { apiRequest } from '../api/apiClient'
import type {
    AdminReservation,
    AdminReservationPage,
    AdminReservationStatus,
} from './adminReservationTypes'

type GetAdminReservationsParams = {
    status?: AdminReservationStatus
    screeningId?: number
    email?: string
    date?: string
    page: number
    size: number
}

export function getAdminReservations(
    params: GetAdminReservationsParams,
    signal?: AbortSignal,
) {
    const searchParams =
        new URLSearchParams()

    if (params.status) {
        searchParams.set(
            'status',
            params.status,
        )
    }

    if (params.screeningId) {
        searchParams.set(
            'screeningId',
            String(params.screeningId),
        )
    }

    if (params.email) {
        searchParams.set(
            'email',
            params.email,
        )
    }

    if (params.date) {
        searchParams.set(
            'date',
            params.date,
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

    return apiRequest<AdminReservationPage>(
        `/api/admin/reservations?${searchParams.toString()}`,
        {
            signal,
        },
    )
}

export function getAdminReservation(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<AdminReservation>(
        `/api/admin/reservations/${id}`,
        {
            signal,
        },
    )
}

export function cancelAdminReservation(
    id: number,
) {
    return apiRequest<AdminReservation>(
        `/api/admin/reservations/${id}`,
        {
            method: 'DELETE',
        },
    )
}