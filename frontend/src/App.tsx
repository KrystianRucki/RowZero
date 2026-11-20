import {
    Route,
    Routes,
} from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AdminLayout } from './components/AdminLayout'
import { PublicLayout } from './components/PublicLayout'
import { AccountPage } from './pages/AccountPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminMovieDetailsPage } from './pages/AdminMovieDetailsPage'
import { AdminMoviesPage } from './pages/AdminMoviesPage'
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
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/movies/:id"
                    element={
                        <MovieDetailsPage />
                    }
                />

                <Route
                    path="/schedule"
                    element={<SchedulePage />}
                />

                <Route
                    path="/screenings/:id"
                    element={
                        <ScreeningDetailsPage />
                    }
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
                    element={
                        <ForbiddenPage />
                    }
                />

                <Route
                    element={
                        <ProtectedRoute />
                    }
                >
                    <Route
                        path="/account"
                        element={<AccountPage />}
                    />

                    <Route
                        path="/reservations"
                        element={
                            <ReservationsPage />
                        }
                    />

                    <Route
                        path="/reservations/:id"
                        element={
                            <ReservationDetailsPage />
                        }
                    />

                    <Route
                        path="/notifications"
                        element={
                            <NotificationsPage />
                        }
                    />
                </Route>

                <Route
                    path="*"
                    element={
                        <NotFoundPage />
                    }
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
                        element={
                            <AdminDashboardPage />
                        }
                    />

                    <Route
                        path="users"
                        element={
                            <AdminUsersPage />
                        }
                    />

                    <Route
                        path="users/:id"
                        element={
                            <AdminUserDetailsPage />
                        }
                    />

                    <Route
                        path="movies"
                        element={
                            <AdminMoviesPage />
                        }
                    />

                    <Route
                        path="movies/import"
                        element={
                            <AdminTmdbImportPage />
                        }
                    />

                    <Route
                        path="movies/:id"
                        element={
                            <AdminMovieDetailsPage />
                        }
                    />
                </Route>
            </Route>
        </Routes>
    )
}