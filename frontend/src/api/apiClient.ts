import type { ApiError } from './apiError'

const ACCESS_TOKEN_STORAGE_KEY = 'rowzero.accessToken'

function readStoredAccessToken() {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        return window.sessionStorage.getItem(
            ACCESS_TOKEN_STORAGE_KEY,
        )
    } catch {
        return null
    }
}

let accessToken: string | null =
    readStoredAccessToken()

export function setAccessToken(token: string | null) {
    accessToken = token

    if (typeof window === 'undefined') {
        return
    }

    try {
        if (token) {
            window.sessionStorage.setItem(
                ACCESS_TOKEN_STORAGE_KEY,
                token,
            )
        } else {
            window.sessionStorage.removeItem(
                ACCESS_TOKEN_STORAGE_KEY,
            )
        }
    } catch {
        return
    }
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
        if (response.status === 401 && accessToken) {
            setAccessToken(null)
        }

        const error = (await response.json()) as ApiError
        throw error
    }

    if (response.status === 204) {
        return undefined as T
    }

    return (await response.json()) as T
}
