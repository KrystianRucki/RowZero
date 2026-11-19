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