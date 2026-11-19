import {
    Route,
    Routes,
} from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { PublicLayout } from './layouts/PublicLayout'
import { AccountPage } from './pages/AccountPage'
import { AdminPage } from './pages/AdminPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { RegisterPage } from './pages/RegisterPage'
import { ReservationsPage } from './pages/ReservationsPage'
import { SchedulePage } from './pages/SchedulePage'

function App() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route
                    path="/"
                    element={<HomePage />}
                />

                <Route
                    path="/schedule"
                    element={<SchedulePage />}
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

                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/account"
                        element={<AccountPage />}
                    />

                    <Route
                        path="/reservations"
                        element={<ReservationsPage />}
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
                    element={<AdminPage />}
                />
            </Route>
        </Routes>
    )
}

export default App