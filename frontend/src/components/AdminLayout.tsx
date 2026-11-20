import {
    NavLink,
    Outlet,
    useNavigate,
} from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import '../styles/admin.css'

function navClass({
                      isActive,
                  }: {
    isActive: boolean
}) {
    return isActive
        ? 'admin-navigation__link admin-navigation__link--active'
        : 'admin-navigation__link'
}

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
                        className={navClass}
                    >
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/admin/users"
                        className={navClass}
                    >
                        Users
                    </NavLink>

                    <NavLink
                        to="/admin/movies"
                        className={navClass}
                    >
                        Movies
                    </NavLink>

                    <NavLink
                        to="/admin/movies/import"
                        className={navClass}
                    >
                        Import TMDB
                    </NavLink>

                    <NavLink
                        to="/admin/halls"
                        className={navClass}
                    >
                        Halls
                    </NavLink>

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