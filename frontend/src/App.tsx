import {
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import {
    Route,
    Routes,
} from 'react-router-dom'
import {
    getAccessToken,
    setAccessToken,
} from './api/apiClient'
import { AuthContext } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AdminLayout } from './components/AdminLayout'
import { PublicLayout } from './components/PublicLayout'
import { AccountPage } from './pages/AccountPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminHallDetailsPage } from './pages/AdminHallDetailsPage'
import { AdminHallsPage } from './pages/AdminHallsPage'
import { AdminMovieDetailsPage } from './pages/AdminMovieDetailsPage'
import { AdminMoviesPage } from './pages/AdminMoviesPage'
import { AdminReservationDetailsPage } from './pages/AdminReservationDetailsPage'
import { AdminReservationsPage } from './pages/AdminReservationsPage'
import { AdminScreeningCreatePage } from './pages/AdminScreeningCreatePage'
import { AdminScreeningDetailsPage } from './pages/AdminScreeningDetailsPage'
import { AdminScreeningsPage } from './pages/AdminScreeningsPage'
import { AdminStatisticsPage } from './pages/AdminStatisticsPage'
import { AdminTmdbImportPage } from './pages/AdminTmdbImportPage'
import { AdminUserDetailsPage } from './pages/AdminUserDetailsPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { RegisterPage } from './pages/RegisterPage'
import { ReservationDetailsPage } from './pages/ReservationDetailsPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { SchedulePage } from './pages/SchedulePage'
import { ScreeningDetailsPage } from './pages/ScreeningDetailsPage'

export default function App() {
    const auth = useContext(AuthContext)

    if (!auth) {
        throw new Error(
            'App must be rendered inside AuthProvider',
        )
    }

    const refreshUser =
        auth.refreshUser

    const restorePromiseRef =
        useRef<Promise<void> | null>(
            null,
        )

    const [
        restoringSession,
        setRestoringSession,
    ] = useState(
        () => getAccessToken() !== null,
    )

    useEffect(() => {
        const token =
            getAccessToken()

        if (!token) {
            setRestoringSession(false)
            return
        }

        let cancelled = false

        if (!restorePromiseRef.current) {
            restorePromiseRef.current =
                refreshUser().catch(() => {
                    setAccessToken(null)
                })
        }

        void restorePromiseRef.current.finally(
            () => {
                if (!cancelled) {
                    setRestoringSession(false)
                }
            },
        )

        return () => {
            cancelled = true
        }
    }, [refreshUser])

    if (restoringSession) {
        return null
    }

    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/movies/:id"
                    element={<MovieDetailsPage />}
                />

                <Route
                    path="/schedule"
                    element={<SchedulePage />}
                />

                <Route
                    path="/screenings/:id"
                    element={<ScreeningDetailsPage />}
                />

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route
                    path="/forbidden"
                    element={<ForbiddenPage />}
                />

                <Route
                    element={<ProtectedRoute />}
                >
                    <Route
                        path="/account"
                        element={<AccountPage />}
                    />

                    <Route
                        path="/reservations"
                        element={<ReservationsPage />}
                    />

                    <Route
                        path="/reservations/:id"
                        element={<ReservationDetailsPage />}
                    />

                    <Route
                        path="/notifications"
                        element={<NotificationsPage />}
                    />
                </Route>

                <Route
                    path="*"
                    element={<NotFoundPage />}
                />
            </Route>

            <Route
                element={
                    <ProtectedRoute
                        requiredRole="ADMIN"
                    />
                }
            >
                <Route
                    path="/admin"
                    element={<AdminLayout />}
                >
                    <Route
                        index
                        element={<AdminDashboardPage />}
                    />

                    <Route
                        path="users"
                        element={<AdminUsersPage />}
                    />

                    <Route
                        path="users/:id"
                        element={<AdminUserDetailsPage />}
                    />

                    <Route
                        path="movies"
                        element={<AdminMoviesPage />}
                    />

                    <Route
                        path="movies/import"
                        element={<AdminTmdbImportPage />}
                    />

                    <Route
                        path="movies/:id"
                        element={<AdminMovieDetailsPage />}
                    />

                    <Route
                        path="halls"
                        element={<AdminHallsPage />}
                    />

                    <Route
                        path="halls/:id"
                        element={<AdminHallDetailsPage />}
                    />

                    <Route
                        path="screenings"
                        element={<AdminScreeningsPage />}
                    />

                    <Route
                        path="screenings/new"
                        element={<AdminScreeningCreatePage />}
                    />

                    <Route
                        path="screenings/:id"
                        element={<AdminScreeningDetailsPage />}
                    />

                    <Route
                        path="reservations"
                        element={<AdminReservationsPage />}
                    />

                    <Route
                        path="reservations/:id"
                        element={<AdminReservationDetailsPage />}
                    />

                    <Route
                        path="statistics"
                        element={<AdminStatisticsPage />}
                    />
                </Route>
            </Route>
        </Routes>
    )
}