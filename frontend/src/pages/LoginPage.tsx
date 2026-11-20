import {
    useState,
    type FormEvent,
} from 'react'
import {
    Link,
    useLocation,
    useNavigate,
} from 'react-router-dom'
import { isApiError } from '../api/apiError'
import { useAuth } from '../auth/useAuth'
import '../styles/auth.css'

type AuthLocationState = {
    from?: string
}

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()

    const { login } = useAuth()

    const state =
        location.state as
            | AuthLocationState
            | null

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
            const user =
                await login({
                    email,
                    password,
                })

            if (state?.from) {
                navigate(
                    state.from,
                    {
                        replace: true,
                    },
                )

                return
            }

            if (
                user.role === 'ADMIN'
            ) {
                navigate('/admin')
                return
            }

            navigate('/')
        } catch (error) {
            if (isApiError(error)) {
                setError(error.message)
            } else {
                setError(
                    'Unable to log in.',
                )
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-card__heading">
                    <p className="eyebrow">
                        Welcome back
                    </p>

                    <h1>Log in</h1>

                    <p>
                        Access your reservations
                        and festival account.
                    </p>
                </div>

                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >
                    <div className="auth-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value,
                                )
                            }
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value,
                                )
                            }
                            required
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="button button--primary auth-submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Logging in...'
                            : 'Log in'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{' '}

                    <Link
                        to="/register"
                        state={state}
                    >
                        Create account
                    </Link>
                </p>
            </div>
        </section>
    )
}