import { apiRequest } from '../api/apiClient'
import type { Notification } from './notificationTypes'

export function getNotifications(
    signal?: AbortSignal,
) {
    return apiRequest<Notification[]>(
        '/api/notifications',
        {
            signal,
        },
    )
}

export function markNotificationRead(
    id: number,
) {
    return apiRequest<void>(
        `/api/notifications/${id}/read`,
        {
            method: 'PATCH',
        },
    )
}