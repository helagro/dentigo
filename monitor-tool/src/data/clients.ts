import * as dotenv from 'dotenv'
dotenv.config()

const SERVICES_AMOUNT: number = parseInt(process.env.SERVICES_AMOUNT ?? '4')

let totalConnected: number | null = null
let clientsConnected: number | null = null

export function processData(message: string) {
    totalConnected = parseInt(message)
    clientsConnected = totalConnected - SERVICES_AMOUNT - 1
}

export function getTotalConnected() {
    return totalConnected ?? 'N/A'
}

export function getClientsConnected() {
    return clientsConnected ?? 'N/A'
}
