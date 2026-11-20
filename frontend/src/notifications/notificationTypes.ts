export type NotificationType =
    | 'RESERVATION_CONFIRMED'
    | 'RESERVATION_CANCELLED'
    | 'RESERVATION_EXPIRED'

export type Notification = {
    id: number
    type: NotificationType
    message: string
    createdAt: string
    readAt: string | null
}