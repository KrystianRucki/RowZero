export type AdminHall = {
    id: number
    name: string
}

export type AdminSeat = {
    id: number
    hallId: number
    rowLabel: string
    number: number
    active: boolean
}