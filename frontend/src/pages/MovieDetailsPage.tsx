import {
    Link,
    useParams,
} from 'react-router-dom'
import '../styles/movies.css'

export function MovieDetailsPage() {
    const { id } = useParams()

    return (
        <section className="page movie-details-placeholder">
            <Link
                to="/"
                className="back-link"
            >
                ← Back to movies
            </Link>

            <div className="movie-details-placeholder__content">
                <p className="eyebrow">
                    Movie #{id}
                </p>

                <h1>
                    Movie details
                </h1>

                <p>
                    Film information and
                    upcoming screenings will
                    appear here.
                </p>
            </div>
        </section>
    )
}