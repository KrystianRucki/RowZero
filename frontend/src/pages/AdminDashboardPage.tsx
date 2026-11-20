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
                        data, programme and user
                        activity.
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
                        Search users and manage
                        account access.
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
                        Manage films and TMDB
                        synchronization.
                    </p>

                    <span className="admin-dashboard-card__action">
            Manage movies →
          </span>
                </Link>

                <Link
                    to="/admin/halls"
                    className="admin-dashboard-card"
                >
          <span className="admin-dashboard-card__label">
            Venue
          </span>

                    <h2>
                        Halls & seats
                    </h2>

                    <p>
                        Configure halls and seat
                        layouts.
                    </p>

                    <span className="admin-dashboard-card__action">
            Manage halls →
          </span>
                </Link>

                <Link
                    to="/admin/screenings"
                    className="admin-dashboard-card"
                >
          <span className="admin-dashboard-card__label">
            Programme
          </span>

                    <h2>
                        Screenings
                    </h2>

                    <p>
                        Create and manage the
                        festival screening
                        schedule.
                    </p>

                    <span className="admin-dashboard-card__action">
            Manage screenings →
          </span>
                </Link>

                <Link
                    to="/admin/reservations"
                    className="admin-dashboard-card"
                >
          <span className="admin-dashboard-card__label">
            Bookings
          </span>

                    <h2>
                        Reservations
                    </h2>

                    <p>
                        Browse, filter and manage
                        festival reservations.
                    </p>

                    <span className="admin-dashboard-card__action">
            Manage reservations →
          </span>
                </Link>

                <Link
                    to="/admin/statistics"
                    className="admin-dashboard-card"
                >
          <span className="admin-dashboard-card__label">
            Insights
          </span>

                    <h2>
                        Occupancy
                    </h2>

                    <p>
                        Monitor hall occupancy,
                        holds and confirmed seats.
                    </p>

                    <span className="admin-dashboard-card__action">
            View statistics →
          </span>
                </Link>
            </div>
        </section>
    )
}