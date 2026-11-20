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

export function RegisterPage() {
    const navigate = useNavigate()
    const location = useLocation()

    const { register } =
        useAuth()

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
            await register({
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

            navigate('/')
        } catch (error) {
            if (isApiError(error)) {
                if (
                    error.fieldErrors.length >
                    0
                ) {
                    setError(
                        error.fieldErrors[0]
                            .message,
                    )
                } else {
                    setError(error.message)
                }
            } else {
                setError(
                    'Unable to create account.',
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
                        Join the festival
                    </p>

                    <h1>
                        Create account
                    </h1>

                    <p>
                        Reserve seats and keep
                        track of your screenings
                        in one place.
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
                            autoComplete="new-password"
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
                            ? 'Creating account...'
                            : 'Create account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}

                    <Link
                        to="/login"
                        state={state}
                    >
                        Log in
                    </Link>
                </p>
            </div>
        </section>
    )
}