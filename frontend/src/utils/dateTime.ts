const FESTIVAL_TIME_ZONE =
    'Europe/Warsaw'

const dateFormatter =
    new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone:
        FESTIVAL_TIME_ZONE,
    })

const longDateFormatter =
    new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone:
        FESTIVAL_TIME_ZONE,
    })

const timeFormatter =
    new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone:
        FESTIVAL_TIME_ZONE,
    })

export function formatDate(
    value: string,
) {
    return dateFormatter.format(
        new Date(value),
    )
}

export function formatLongDate(
    value: string,
) {
    return longDateFormatter.format(
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