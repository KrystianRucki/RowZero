import { apiRequest } from '../api/apiClient'
import type {
    AdminHall,
    AdminSeat,
} from './adminHallTypes'

export function getAdminHalls(
    signal?: AbortSignal,
) {
    return apiRequest<AdminHall[]>(
        '/api/admin/halls',
        {
            signal,
        },
    )
}

export function getAdminHall(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<AdminHall>(
        `/api/admin/halls/${id}`,
        {
            signal,
        },
    )
}

export function createAdminHall(
    name: string,
) {
    return apiRequest<AdminHall>(
        '/api/admin/halls',
        {
            method: 'POST',
            body: JSON.stringify({
                name,
            }),
        },
    )
}

export function updateAdminHall(
    id: number,
    name: string,
) {
    return apiRequest<AdminHall>(
        `/api/admin/halls/${id}`,
        {
            method: 'PUT',
            body: JSON.stringify({
                name,
            }),
        },
    )
}

export function deleteAdminHall(
    id: number,
) {
    return apiRequest<void>(
        `/api/admin/halls/${id}`,
        {
            method: 'DELETE',
        },
    )
}

export function getAdminSeats(
    hallId: number,
    signal?: AbortSignal,
) {
    return apiRequest<AdminSeat[]>(
        `/api/admin/halls/${hallId}/seats`,
        {
            signal,
        },
    )
}

export function createAdminSeat(
    hallId: number,
    rowLabel: string,
    number: number,
    active: boolean,
) {
    return apiRequest<AdminSeat>(
        `/api/admin/halls/${hallId}/seats`,
        {
            method: 'POST',
            body: JSON.stringify({
                rowLabel,
                number,
                active,
            }),
        },
    )
}

export function updateAdminSeat(
    seat: AdminSeat,
) {
    return apiRequest<AdminSeat>(
        `/api/admin/seats/${seat.id}`,
        {
            method: 'PUT',
            body: JSON.stringify({
                rowLabel: seat.rowLabel,
                number: seat.number,
                active: seat.active,
            }),
        },
    )
}

export function deleteAdminSeat(
    id: number,
) {
    return apiRequest<void>(
        `/api/admin/seats/${id}`,
        {
            method: 'DELETE',
        },
    )
}