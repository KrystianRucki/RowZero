import { apiRequest } from '../api/apiClient'
import type {
    AdminScreening,
    AdminScreeningSeat,
    AdminScreeningsPage,
    CreateAdminScreeningRequest,
    UpdateAdminScreeningRequest,
} from './adminScreeningTypes'

export function getAdminScreenings(
    page: number,
    size: number,
    signal?: AbortSignal,
) {
    const searchParams =
        new URLSearchParams()

    searchParams.set(
        'page',
        String(page),
    )

    searchParams.set(
        'size',
        String(size),
    )

    return apiRequest<AdminScreeningsPage>(
        `/api/admin/screenings?${searchParams.toString()}`,
        {
            signal,
        },
    )
}

export function getAdminScreening(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<AdminScreening>(
        `/api/admin/screenings/${id}`,
        {
            signal,
        },
    )
}

export function getAdminScreeningSeats(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<AdminScreeningSeat[]>(
        `/api/admin/screenings/${id}/seats`,
        {
            signal,
        },
    )
}

export function createAdminScreening(
    request: CreateAdminScreeningRequest,
) {
    return apiRequest<AdminScreening>(
        '/api/admin/screenings',
        {
            method: 'POST',
            body: JSON.stringify(request),
        },
    )
}

export function updateAdminScreening(
    id: number,
    request: UpdateAdminScreeningRequest,
) {
    return apiRequest<AdminScreening>(
        `/api/admin/screenings/${id}`,
        {
            method: 'PUT',
            body: JSON.stringify(request),
        },
    )
}

export function cancelAdminScreening(
    id: number,
) {
    return apiRequest<void>(
        `/api/admin/screenings/${id}`,
        {
            method: 'DELETE',
        },
    )
}