import { apiRequest } from '../api/apiClient'
import type {
    AdminUser,
    AdminUsersPage,
} from './adminUserTypes'

type GetAdminUsersParams = {
    search?: string
    enabled?: boolean
    page: number
    size: number
}

export function getAdminUsers(
    params: GetAdminUsersParams,
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
        params.enabled !==
        undefined
    ) {
        searchParams.set(
            'enabled',
            String(params.enabled),
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

    return apiRequest<AdminUsersPage>(
        `/api/admin/users?${searchParams.toString()}`,
        {
            signal,
        },
    )
}

export function getAdminUser(
    id: number,
    signal?: AbortSignal,
) {
    return apiRequest<AdminUser>(
        `/api/admin/users/${id}`,
        {
            signal,
        },
    )
}

export function updateAdminUserStatus(
    id: number,
    enabled: boolean,
) {
    return apiRequest<AdminUser>(
        `/api/admin/users/${id}`,
        {
            method: 'PATCH',
            body: JSON.stringify({
                enabled,
            }),
        },
    )
}