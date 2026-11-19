import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.ts'
import type { UserRole } from './authTypes.ts'

type Props = {
    requiredRole?: UserRole
}

export function ProtectedRoute({
                                   requiredRole,
                               }: Props) {
    const {
        user,
        isAuthenticated,
    } = useAuth()

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        )
    }

    if (
        requiredRole &&
        user?.role !== requiredRole
    ) {
        return (
            <Navigate
                to="/forbidden"
                replace
            />
        )
    }

    return <Outlet />
}