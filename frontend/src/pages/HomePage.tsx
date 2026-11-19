import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function HomePage() {
    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth()

    return (
        <main>
            <h1>RowZero</h1>

            {!isAuthenticated && (
                <nav>
                    <Link to="/login">
                        Login
                    </Link>

                    {' | '}

                    <Link to="/register">
                        Register
                    </Link>
                </nav>
            )}

            {isAuthenticated && (
                <>
                    <p>
                        Logged in as {user?.email}
                    </p>

                    <nav>
                        <Link to="/account">
                            My account
                        </Link>

                        {user?.role === 'ADMIN' && (
                            <>
                                {' | '}
                                <Link to="/admin">
                                    Admin panel
                                </Link>
                            </>
                        )}

                        {' | '}

                        <button onClick={logout}>
                            Logout
                        </button>
                    </nav>
                </>
            )}
        </main>
    )
}