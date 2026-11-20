export function getRemainingSeconds(
    expiresAt: string,
) {
    const remaining =
        new Date(expiresAt).getTime() -
        Date.now()

    return Math.max(
        0,
        Math.ceil(remaining / 1000),
    )
}

export function formatCountdown(
    seconds: number,
) {
    const minutes =
        Math.floor(seconds / 60)

    const remainingSeconds =
        seconds % 60

    return `${String(minutes).padStart(
        2,
        '0',
    )}:${String(
        remainingSeconds,
    ).padStart(2, '0')}`
}