import {
    Navigate,
    Outlet,
    useLocation,
} from 'react-router-dom'
import { useAuth } from './useAuth'
import type { UserRole } from './authTypes'

type Props = {
    requiredRole?: UserRole
}

export function ProtectedRoute({
                                   requiredRole,
                               }: Props) {
    const location =
        useLocation()

    const {
        user,
        isAuthenticated,
    } = useAuth()

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location.pathname +
                        location.search,
                }}
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