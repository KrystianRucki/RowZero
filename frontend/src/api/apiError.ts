export type ApiFieldError = {
    field: string
    message: string
}

export type ApiError = {
    timestamp: string
    status: number
    error: string
    message: string
    path: string
    fieldErrors: ApiFieldError[]
}

export function isApiError(error: unknown): error is ApiError {
    if (typeof error !== 'object' || error === null) {
        return false
    }

    return (
        'status' in error &&
        'message' in error &&
        typeof error.status === 'number' &&
        typeof error.message === 'string'
    )
}