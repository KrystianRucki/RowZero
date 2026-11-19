import type { ApiError } from './apiError'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
    accessToken = token
}

export function getAccessToken() {
    return accessToken
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers)

    if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json')
    }

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`)
    }

    const response = await fetch(path, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const error = (await response.json()) as ApiError
        throw error
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}