import { Link } from 'react-router-dom'
import '../styles/userArea.css'

export function ForbiddenPage() {
    return (
        <section className="page system-page">
            <div className="system-page__code">
                403
            </div>

            <p className="eyebrow">
                Access denied
            </p>

            <h1>
                You don't have access
                to this page
            </h1>

            <p>
                Your account does not have
                permission to view this
                section.
            </p>

            <Link
                to="/"
                className="button button--primary"
            >
                Back to movies
            </Link>
        </section>
    )
}