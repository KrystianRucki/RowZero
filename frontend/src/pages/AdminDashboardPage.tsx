import { Link } from 'react-router-dom'
import '../styles/admin.css'

export function AdminDashboardPage() {
    return (
        <section className="admin-page">
            <div className="admin-page-heading">
                <div>
                    <p className="eyebrow">
                        Administration
                    </p>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Manage RowZero festival
                        data and user accounts.
                    </p>
                </div>
            </div>

            <div className="admin-dashboard-grid">
                <Link
                    to="/admin/users"
                    className="admin-dashboard-card"
                >
          <span className="admin-dashboard-card__label">
            Accounts
          </span>

                    <h2>
                        Users
                    </h2>

                    <p>
                        Search users, review
                        account information and
                        manage account status.
                    </p>

                    <span className="admin-dashboard-card__action">
            Manage users →
          </span>
                </Link>

                <Link
                    to="/admin/movies"
                    className="admin-dashboard-card"
                >
          <span className="admin-dashboard-card__label">
            Catalogue
          </span>

                    <h2>
                        Movies
                    </h2>

                    <p>
                        Manage the local movie
                        catalogue, visibility and
                        TMDB synchronization.
                    </p>

                    <span className="admin-dashboard-card__action">
            Manage movies →
          </span>
                </Link>

                <div className="admin-dashboard-card admin-dashboard-card--inactive">
          <span className="admin-dashboard-card__label">
            Venue
          </span>

                    <h2>
                        Halls & seats
                    </h2>

                    <p>
                        Cinema halls and seat
                        layouts.
                    </p>

                    <span className="admin-dashboard-card__status">
            Next stage
          </span>
                </div>

                <div className="admin-dashboard-card admin-dashboard-card--inactive">
          <span className="admin-dashboard-card__label">
            Programme
          </span>

                    <h2>
                        Screenings
                    </h2>

                    <p>
                        Screening schedule and
                        availability.
                    </p>

                    <span className="admin-dashboard-card__status">
            Coming next
          </span>
                </div>
            </div>
        </section>
    )
}