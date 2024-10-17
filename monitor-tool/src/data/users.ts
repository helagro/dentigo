let numberOfClientsAuthenticating: number | null = null

export function processData(message: string) {
    const payload = JSON.parse(message)

    numberOfClientsAuthenticating = parseInt(payload.numberOfClientsAuthenticating)
}

export function getNumberOfClientsAuthenticating() {
    return numberOfClientsAuthenticating ?? 'N/A'
}
