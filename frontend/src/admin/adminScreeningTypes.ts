export type AdminScreeningStatus =
    | 'SCHEDULED'
    | 'CANCELLED'

export type AdminScreening = {
    id: number
    movieId: number
    movieTitle: string
    hallId: number
    hallName: string
    startAt: string
    endAt: string
    status: AdminScreeningStatus
}

export type AdminScreeningsPage = {
    content: AdminScreening[]
    totalElements: number
    totalPages: number
    size: number
    page?: number
}

export type AdminScreeningSeat = {
    id: number
    seatId: number
    rowLabel: string
    number: number
}

export type CreateAdminScreeningRequest = {
    movieId: number
    hallId: number
    startAt: string
    endAt: string
}

export type UpdateAdminScreeningRequest = {
    movieId: number
    startAt: string
    endAt: string
}