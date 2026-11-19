import {
    Link,
    useParams,
} from 'react-router-dom'

export function ScreeningDetailsPage() {
    const { id } = useParams()

    return (
        <section className="page">
            <Link
                to="/schedule"
                className="back-link"
            >
                ← Back to schedule
            </Link>

            <div className="page-heading">
                <p className="eyebrow">
                    Screening #{id}
                </p>

                <h1>
                    Screening details
                </h1>

                <p>
                    Screening information and
                    seat availability will appear
                    here.
                </p>
            </div>
        </section>
    )
}