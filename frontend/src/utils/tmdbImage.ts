const TMDB_IMAGE_BASE_URL =
    'https://image.tmdb.org/t/p'

export function getTmdbPosterUrl(
    posterPath: string | null | undefined,
    size = 'w185',
) {
    if (!posterPath) {
        return null
    }

    return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`
}

export function getTmdbBackdropUrl(
    backdropPath: string | null | undefined,
    size = 'w780',
) {
    if (!backdropPath) {
        return null
    }

    return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`
}