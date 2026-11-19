import { useState, type ReactNode } from 'react'
import {
    getAccessToken,
    setAccessToken,
} from '../api/apiClient'
import {
    getCurrentUser,
    loginRequest,
    registerRequest,
} from './authApi.ts'
import { AuthContext } from './AuthContext.ts'
import type {
    AuthUser,
    LoginRequest,
    RegisterRequest,
} from './authTypes.ts'

type Props = {
    children: ReactNode
}

export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<AuthUser | null>(null)

    async function login(data: LoginRequest) {
        const response = await loginRequest(data)

        setAccessToken(response.accessToken)

        try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
            return currentUser
        } catch (error) {
            setAccessToken(null)
            setUser(null)
            throw error
        }
    }

    async function register(data: RegisterRequest) {
        const response = await registerRequest(data)

        setAccessToken(response.accessToken)

        try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
            return currentUser
        } catch (error) {
            setAccessToken(null)
            setUser(null)
            throw error
        }
    }

    function logout() {
        setAccessToken(null)
        setUser(null)
    }

    async function refreshUser() {
        if (!getAccessToken()) {
            setUser(null)
            return
        }

        try {
            const currentUser = await getCurrentUser()
            setUser(currentUser)
        } catch (error) {
            setAccessToken(null)
            setUser(null)
            throw error
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: user !== null,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}