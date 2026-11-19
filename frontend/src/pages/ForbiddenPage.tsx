import { Link } from 'react-router-dom'

export function ForbiddenPage() {
    return (
        <main>
            <h1>403</h1>
            <p>You do not have access to this page.</p>

            <Link to="/">
                Back to home
            </Link>
        </main>
    )
}