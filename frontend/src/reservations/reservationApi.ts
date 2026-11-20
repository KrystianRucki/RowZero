import { apiRequest } from '../api/apiClient'
import type { Reservation } from './reservationTypes'

export function createReservation(
    screeningSeatId: number,
) {
    return apiRequest<Reservation>(
        '/api/reservations',
        {
            method: 'POST',
            body: JSON.stringify({
                screeningSeatId,
            }),
        },
    )
}

export function getReservation(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<Reservation>(
        `/api/reservations/${id}`,
        {
            signal,
        },
    )
}

export function getMyReservations(
    signal?: AbortSignal,
) {
    return apiRequest<Reservation[]>(
        '/api/reservations/my',
        {
            signal,
        },
    )
}

export function confirmReservation(
    id: number,
) {
    return apiRequest<Reservation>(
        `/api/reservations/${id}/confirm`,
        {
            method: 'POST',
        },
    )
}

export function cancelReservation(
    id: number,
) {
    return apiRequest<Reservation>(
        `/api/reservations/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'CANCELLED',
            }),
        },
    )
}