const TMDB_POSTER_BASE_URL =
    'https://image.tmdb.org/t/p/w500'

const TMDB_BACKDROP_BASE_URL =
    'https://image.tmdb.org/t/p/w1280'

export function getMoviePosterUrl(
    posterPath: string | null,
) {
    if (!posterPath) {
        return null
    }

    return `${TMDB_POSTER_BASE_URL}${posterPath}`
}

export function getMovieBackdropUrl(
    backdropPath: string | null,
) {
    if (!backdropPath) {
        return null
    }

    return `${TMDB_BACKDROP_BASE_URL}${backdropPath}`
}