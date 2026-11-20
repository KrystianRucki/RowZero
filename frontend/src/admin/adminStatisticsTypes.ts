export type ScreeningOccupancy = {
    screeningId: number
    movieId: number
    movieTitle: string
    hallId: number
    hallName: string
    startAt: string
    endAt: string
    capacity: number
    confirmedSeats: number
    heldSeats: number
    occupiedSeats: number
    availableSeats: number
    occupancyPercent: number
}