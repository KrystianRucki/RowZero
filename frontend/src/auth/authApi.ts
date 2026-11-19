import { apiRequest } from '../api/apiClient'
import type {
    AuthResponse,
    AuthUser,
    LoginRequest,
    RegisterRequest,
} from './authTypes.ts'

export function loginRequest(data: LoginRequest) {
    return apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export function registerRequest(data: RegisterRequest) {
    return apiRequest<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export function getCurrentUser() {
    return apiRequest<AuthUser>('/api/users/me')
}