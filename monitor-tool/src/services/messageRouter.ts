import { SubTopic } from '../Topic'
import { processData as processClientData } from '../data/clients'
import { processData as processBookingData } from '../data/bookings'
import { processData as processUserData } from '../data/users'

export function route(topic: string, message: string) {
    switch (topic) {
        case SubTopic.CONNECTED_AMT:
            processClientData(message)
            break
        case SubTopic.BOOKING_STATS:
            processBookingData(message)
            break
        case SubTopic.USER_STATS:
            console.log(message)
            processUserData(message)
            break
        default:
            throw new Error('Unhandled topic: ' + topic)
    }
}
