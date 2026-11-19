import { useAuth } from '../auth/useAuth'

export function AccountPage() {
    const { user } = useAuth()

    return (
        <main>
            <h1>My account</h1>

            <p>Email: {user?.email}</p>
            <p>Role: {user?.role}</p>
        </main>
    )
}