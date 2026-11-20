export type Screening = {
    id: number
    movieId: number
    movieTitle: string
    hallId: number
    hallName: string
    startAt: string
    endAt: string
    status?: string
}

export type ScreeningSeat = {
    id: number
    seatId: number
    rowLabel: string
    number: number
    available: boolean
}