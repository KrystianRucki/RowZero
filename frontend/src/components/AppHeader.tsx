import {
    NavLink,
    useNavigate,
} from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

function navLinkClassName({
                              isActive,
                          }: {
    isActive: boolean
}) {
    return isActive
        ? 'main-nav__link main-nav__link--active'
        : 'main-nav__link'
}

export function AppHeader() {
    const navigate = useNavigate()

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth()

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
                        className={navLinkClassName}
                    >
                        Movies
                    </NavLink>

                    <NavLink
                        to="/schedule"
                        className={navLinkClassName}
                    >
                        Schedule
                    </NavLink>

                    {isAuthenticated && (
                        <>
                            <NavLink
                                to="/reservations"
                                className={navLinkClassName}
                            >
                                My reservations
                            </NavLink>

                            <NavLink
                                to="/notifications"
                                className={navLinkClassName}
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
                            {user?.role === 'ADMIN' && (
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
                                onClick={handleLogout}
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