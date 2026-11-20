import {
    useNavigate,
} from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import '../styles/userArea.css'

export function AccountPage() {
    const navigate = useNavigate()

    const {
        user,
        logout,
    } = useAuth()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <section className="page user-area-page account-page">
            <div className="user-area-heading">
                <div>
                    <p className="eyebrow">
                        Account
                    </p>

                    <h1>
                        My account
                    </h1>

                    <p>
                        Your RowZero account
                        information.
                    </p>
                </div>
            </div>

            <div className="account-card">
                <div className="account-avatar">
                    {user?.email
                        .charAt(0)
                        .toUpperCase()}
                </div>

                <div className="account-information">
                    <div>
                        <span>Email</span>

                        <strong>
                            {user?.email}
                        </strong>
                    </div>

                    <div>
                        <span>Role</span>

                        <strong>
                            {user?.role}
                        </strong>
                    </div>

                    <div>
                        <span>Account status</span>

                        <strong>
                            {user?.enabled
                                ? 'Active'
                                : 'Disabled'}
                        </strong>
                    </div>
                </div>

                <button
                    type="button"
                    className="button button--secondary"
                    onClick={handleLogout}
                >
                    Log out
                </button>
            </div>
        </section>
    )
}