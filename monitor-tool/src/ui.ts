import { getClientsConnected, getTotalConnected } from './data/clients'
import { getCountBooked, getCountAvailable, getPercentageBooked } from './data/bookings'
import { getNumberOfClientsAuthenticating } from './data/users'
import { getPromise } from './freeze'

let refreshCount = 0

export async function update() {
    await getPromise()

    console.clear()

    console.log('----------------- MQTT MONITOR -----------------\n')
    console.log('Refresh count:                   ', refreshCount++, '\n')

    console.log('Number of connections to broker: ', getTotalConnected())
    console.log('Number of clients connected:     ', getClientsConnected(), '\n')

    console.log('Number of clients authenticating ', getNumberOfClientsAuthenticating(), '\n')

    console.log('Number of timeslots available:   ', getCountAvailable())
    console.log('Number of timeslots booked:      ', getCountBooked())
    console.log('Percentage of timeslots booked:  ', getPercentageBooked(), '%')
}
