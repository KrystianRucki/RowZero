export type AdminUserRole =
    | 'USER'
    | 'ADMIN'

export type AdminUser = {
    id: number
    email: string
    role: AdminUserRole
    enabled: boolean
    createdAt: string
}

export type AdminUsersPage = {
    content: AdminUser[]
    totalElements: number
    totalPages: number
    size: number
    number?: number
}