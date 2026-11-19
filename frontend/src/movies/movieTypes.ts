export type Movie = {
    id: number
    tmdbId: number
    title: string
    originalTitle: string | null
    overview: string | null
    runtime: number | null
    releaseDate: string | null
    posterPath: string | null
    backdropPath: string | null
}

export type PageResponse<T> = {
    content: T[]
    number: number
    size: number
    totalElements: number
    totalPages: number
    first: boolean
    last: boolean
    numberOfElements: number
}