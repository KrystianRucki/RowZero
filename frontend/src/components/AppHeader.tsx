import {
    Link,
    NavLink,
    useNavigate,
} from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import '../styles/appHeader.css'

function navClass({
                      isActive,
                  }: {
    isActive: boolean
}) {
    return isActive
        ? 'rz-header-nav__link rz-header-nav__link--active'
        : 'rz-header-nav__link'
}

export function AppHeader() {
    const navigate = useNavigate()

    const {
        user,
        logout,
    } = useAuth()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    const avatarLetter =
        user?.email
            ?.trim()
            .charAt(0)
            .toUpperCase() || 'U'

    return (
        <header className="rz-header">
            <div className="rz-header__inner">
                <div className="rz-header__top">
                    <Link
                        to="/"
                        className="rz-header__brand"
                    >
                        RowZero
                    </Link>

                    <div className="rz-header__actions">
                        {user ? (
                            <>
                                {user.role === 'ADMIN' && (
                                    <Link
                                        to="/admin"
                                        className="rz-header__admin-desktop"
                                    >
                                        Admin panel
                                    </Link>
                                )}

                                <Link
                                    to="/account"
                                    className="rz-header__avatar"
                                    aria-label="Account"
                                >
                                    {avatarLetter}
                                </Link>

                                <button
                                    type="button"
                                    className="rz-header__logout"
                                    onClick={handleLogout}
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="rz-header__login"
                                >
                                    Log in
                                </Link>

                                <Link
                                    to="/register"
                                    className="rz-header__register"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <nav className="rz-header-nav">
                    <div className="rz-header-nav__scroll">
                        <NavLink
                            to="/"
                            end
                            className={navClass}
                        >
                            Movies
                        </NavLink>

                        <NavLink
                            to="/schedule"
                            className={navClass}
                        >
                            Schedule
                        </NavLink>

                        {user && (
                            <NavLink
                                to="/reservations"
                                className={navClass}
                            >
                                My reservations
                            </NavLink>
                        )}

                        {user && (
                            <NavLink
                                to="/notifications"
                                className={navClass}
                            >
                                Notifications
                            </NavLink>
                        )}

                        {user?.role === 'ADMIN' && (
                            <NavLink
                                to="/admin"
                                className="rz-header-nav__link rz-header-nav__admin-mobile"
                            >
                                Admin
                            </NavLink>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    )
}