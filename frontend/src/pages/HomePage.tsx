import { Link } from 'react-router-dom'

export function HomePage() {
    return (
        <main>
            <h1>RowZero</h1>

            <nav>
                <Link to="/login">Login</Link>
                {' | '}
                <Link to="/register">Register</Link>
            </nav>
        </main>
    )
}