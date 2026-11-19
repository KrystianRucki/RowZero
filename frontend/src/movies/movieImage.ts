const TMDB_POSTER_BASE_URL =
    'https://image.tmdb.org/t/p/w500'

export function getMoviePosterUrl(
    posterPath: string | null,
) {
    if (!posterPath) {
        return null
    }

    return `${TMDB_POSTER_BASE_URL}${posterPath}`
}