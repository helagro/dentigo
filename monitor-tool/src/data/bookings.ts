let countAvailable: number | null = null
let countBooked: number | null = null

export function processData(message: string) {
    const payload = JSON.parse(message)

    countAvailable = parseInt(payload.countAvailable)
    countBooked = parseInt(payload.countBooked)
}

export function getCountAvailable() {
    return countAvailable ?? 'N/A'
}

export function getCountBooked() {
    return countBooked ?? 'N/A'
}

export function getPercentageBooked() {
    if (countAvailable === null || countBooked === null) {
        return 'N/A'
    }

    return Math.round((countBooked / (countAvailable + countBooked)) * 100)
}
