import {
    Route,
    Routes,
} from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AccountPage } from './pages/AccountPage'
import { AdminPage } from './pages/AdminPage'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RegisterPage } from './pages/RegisterPage'

function App() {
    return (
        <Routes>
            <Route
                path="/"
                element={<HomePage />}
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

            <Route
                path="*"
                element={<NotFoundPage />}
            />
        </Routes>
    )
}

export default App