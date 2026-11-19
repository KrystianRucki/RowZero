import { createContext } from 'react'
import type {
    AuthUser,
    LoginRequest,
    RegisterRequest,
} from './authTypes.ts'

export type AuthContextValue = {
    user: AuthUser | null
    isAuthenticated: boolean
    login: (data: LoginRequest) => Promise<AuthUser>
    register: (data: RegisterRequest) => Promise<AuthUser>
    logout: () => void
    refreshUser: () => Promise<void>
}

export const AuthContext =
    createContext<AuthContextValue | undefined>(undefined)