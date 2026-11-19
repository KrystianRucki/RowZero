type Props = {
    page: number
    totalPages: number
    onPageChange: (
        page: number,
    ) => void
}

export function Pagination({
                               page,
                               totalPages,
                               onPageChange,
                           }: Props) {
    if (totalPages <= 1) {
        return null
    }

    return (
        <nav
            className="pagination"
            aria-label="Movies pagination"
        >
            <button
                type="button"
                className="pagination__button"
                disabled={page === 0}
                onClick={() =>
                    onPageChange(page - 1)
                }
            >
                ← Previous
            </button>

            <span className="pagination__status">
        Page{' '}
                <strong>{page + 1}</strong>
                {' '}of{' '}
                <strong>{totalPages}</strong>
      </span>

            <button
                type="button"
                className="pagination__button"
                disabled={
                    page >= totalPages - 1
                }
                onClick={() =>
                    onPageChange(page + 1)
                }
            >
                Next →
            </button>
        </nav>
    )
}