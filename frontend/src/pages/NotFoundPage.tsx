import { Link } from 'react-router-dom'
import '../styles/userArea.css'

export function NotFoundPage() {
    return (
        <section className="page system-page">
            <div className="system-page__code">
                404
            </div>

            <p className="eyebrow">
                Page not found
            </p>

            <h1>
                This page doesn't exist
            </h1>

            <p>
                The address may be incorrect
                or the page may have moved.
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