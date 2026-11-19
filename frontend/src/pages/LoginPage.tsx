import {
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useNavigate,
} from 'react-router-dom'
import { isApiError } from '../api/apiError'
import { useAuth } from '../auth/useAuth'

export function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] =
        useState('')

    const [password, setPassword] =
        useState('')

    const [error, setError] =
        useState<string | null>(null)

    const [loading, setLoading] =
        useState(false)

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setLoading(true)
        setError(null)

        try {
            const user = await login({
                email,
                password,
            })

            if (user.role === 'ADMIN') {
                navigate('/admin')
                return
            }

            navigate('/')
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError('Unable to log in')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">
                        Password
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />
                </div>

                {error && (
                    <p>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? 'Logging in...'
                        : 'Login'}
                </button>
            </form>

            <p>
                No account?{' '}
                <Link to="/register">
                    Register
                </Link>
            </p>
        </main>
    )
}