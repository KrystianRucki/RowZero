export type ReservationStatus =
    | 'HELD'
    | 'CONFIRMED'
    | 'CANCELLED'
    | 'EXPIRED'

export type Reservation = {
    id: number
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
    status: ReservationStatus
    createdAt: string
    expiresAt: string | null
    confirmedAt: string | null
    cancelledAt: string | null
}