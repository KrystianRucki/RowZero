export type AdminMovie = {
    id: number
    tmdbId: number
    title: string
    originalTitle: string | null
    overview: string | null
    runtime: number | null
    releaseDate: string | null
    posterPath: string | null
    backdropPath: string | null
    visible: boolean
    lastSyncedAt: string | null
}

export type AdminMoviesPage = {
    content: AdminMovie[]
    page: number
    size: number
    totalElements: number
    totalPages: number
}

export type TmdbMovieSearchResult = {
    tmdbId: number
    title: string
    originalTitle?: string | null
    overview?: string | null
    releaseDate?: string | null
    posterPath?: string | null
    backdropPath?: string | null
}

export type TmdbMovieSearchResponse =
    | TmdbMovieSearchResult[]
    | {
    content?: TmdbMovieSearchResult[]
    results?: TmdbMovieSearchResult[]
    page?: number
    totalPages?: number
    totalResults?: number
}