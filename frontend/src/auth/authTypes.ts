export type UserRole = 'USER' | 'ADMIN'

export type AuthUser = {
    id: number
    email: string
    role: UserRole
    enabled: boolean
}

export type LoginRequest = {
    email: string
    password: string
}

export type RegisterRequest = {
    email: string
    password: string
}

export type AuthResponse = {
    accessToken: string
    tokenType: string
    expiresIn: number
    user: AuthUser
}