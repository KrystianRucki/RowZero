import {
    NavLink,
    Outlet,
    useNavigate,
} from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import '../styles/admin.css'

export function AdminLayout() {
    const navigate = useNavigate()

    const {
        user,
        logout,
    } = useAuth()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-sidebar__brand">
                    <NavLink to="/">
                        RowZero
                    </NavLink>

                    <span>
            Administration
          </span>
                </div>

                <nav className="admin-navigation">
                    <NavLink
                        to="/admin"
                        end
                        className={({
                                        isActive,
                                    }) =>
                            isActive
                                ? 'admin-navigation__link admin-navigation__link--active'
                                : 'admin-navigation__link'
                        }
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={({
                                        isActive,
                                    }) =>
                            isActive
                                ? 'admin-navigation__link admin-navigation__link--active'
                                : 'admin-navigation__link'
                        }
                    >
                        Users
                    </NavLink>

                    <div className="admin-navigation__link admin-navigation__link--disabled">
                        Movies
                    </div>

                    <div className="admin-navigation__link admin-navigation__link--disabled">
                        Halls
                    </div>

                    <div className="admin-navigation__link admin-navigation__link--disabled">
                        Screenings
                    </div>

                    <div className="admin-navigation__link admin-navigation__link--disabled">
                        Reservations
                    </div>
                </nav>

                <div className="admin-sidebar__bottom">
                    <div className="admin-sidebar__user">
            <span>
              Signed in as
            </span>

                        <strong>
                            {user?.email}
                        </strong>
                    </div>

                    <NavLink
                        to="/"
                        className="button button--secondary"
                    >
                        Public site
                    </NavLink>

                    <button
                        type="button"
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        Log out
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    )
}