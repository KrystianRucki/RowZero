const dateFormatter =
    new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })

const timeFormatter =
    new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    })

export function formatDate(
    value: string,
) {
    return dateFormatter.format(
        new Date(value),
    )
}

export function formatTime(
    value: string,
) {
    return timeFormatter.format(
        new Date(value),
    )
}

export function formatScreeningTime(
    startAt: string,
    endAt: string,
) {
    return `${formatTime(startAt)} – ${formatTime(endAt)}`
}