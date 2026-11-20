export type AdminReservationStatus =
    | 'HELD'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'EXPIRED'

export type AdminReservation = {
    id: number
    userId: number
    userEmail: string
    screeningId: number
    movieId: number
    movieTitle: string
    hallId: number
    hallName: string
    screeningSeatId: number
    seatId: number
    rowLabel: string
    seatNumber: number
    screeningStartAt: string
    screeningEndAt: string
    status: AdminReservationStatus
    createdAt: string
    expiresAt: string | null
    confirmedAt: string | null
    cancelledAt: string | null
}

export type AdminReservationPage = {
    content: AdminReservation[]
    page: number
    size: number
    totalElements: number
    totalPages: number
}