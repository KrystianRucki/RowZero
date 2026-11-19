import {
    NavLink,
    useLocation,
    useNavigate,
} from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function AppHeader() {
    const navigate = useNavigate()
    const location = useLocation()

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth()

    const moviesActive =
        location.pathname === '/' ||
        location.pathname.startsWith(
            '/movies/',
        )

    const scheduleActive =
        location.pathname ===
        '/schedule' ||
        location.pathname.startsWith(
            '/screenings/',
        )

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <header className="app-header">
            <div className="app-header__inner">
                <NavLink
                    to="/"
                    className="brand"
                >
                    RowZero
                </NavLink>

                <nav className="main-nav">
                    <NavLink
                        to="/"
                        end
                        className={
                            moviesActive
                                ? 'main-nav__link main-nav__link--active'
                                : 'main-nav__link'
                        }
                        aria-current={
                            moviesActive
                                ? 'page'
                                : undefined
                        }
                    >
                        Movies
                    </NavLink>

                    <NavLink
                        to="/schedule"
                        className={
                            scheduleActive
                                ? 'main-nav__link main-nav__link--active'
                                : 'main-nav__link'
                        }
                        aria-current={
                            scheduleActive
                                ? 'page'
                                : undefined
                        }
                    >
                        Schedule
                    </NavLink>

                    {isAuthenticated && (
                        <>
                            <NavLink
                                to="/reservations"
                                className={({
                                                isActive,
                                            }) =>
                                    isActive
                                        ? 'main-nav__link main-nav__link--active'
                                        : 'main-nav__link'
                                }
                            >
                                My reservations
                            </NavLink>

                            <NavLink
                                to="/notifications"
                                className={({
                                                isActive,
                                            }) =>
                                    isActive
                                        ? 'main-nav__link main-nav__link--active'
                                        : 'main-nav__link'
                                }
                            >
                                Notifications
                            </NavLink>
                        </>
                    )}
                </nav>

                <div className="app-header__actions">
                    {!isAuthenticated && (
                        <>
                            <NavLink
                                to="/login"
                                className="header-link"
                            >
                                Log in
                            </NavLink>

                            <NavLink
                                to="/register"
                                className="button button--primary"
                            >
                                Create account
                            </NavLink>
                        </>
                    )}

                    {isAuthenticated && (
                        <>
                            {user?.role ===
                                'ADMIN' && (
                                    <NavLink
                                        to="/admin"
                                        className="header-link"
                                    >
                                        Admin
                                    </NavLink>
                                )}

                            <NavLink
                                to="/account"
                                className="account-button"
                                aria-label="My account"
                            >
                                {user?.email
                                    .charAt(0)
                                    .toUpperCase()}
                            </NavLink>

                            <button
                                type="button"
                                className="button button--secondary"
                                onClick={
                                    handleLogout
                                }
                            >
                                Log out
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}