import * as mqtt from 'mqtt'
import { route } from './messageRouter'
import { SubTopic } from '../Topic'
import { update as updateUI } from '../ui'
import { delay } from '../freeze'

const MQTT_BROKER_URI = process.env.MQTT_URI || 'mqtt://mqtt.jnsl.tk'
const ERROR_MESSAGE_READ_DELAY = parseInt(process.env.ERROR_MESSAGE_READ_DELAY ?? '3000')

const client = mqtt.connect(MQTT_BROKER_URI)

/* ------------------------- CONNECT ------------------------ */

let connectedResolve: () => void = () => {}
export const connected = new Promise<void>((resolve, _) => {
    connectedResolve = resolve
})

export function connect() {
    client.on('connect', () => {
        console.log('Connected to MQTT broker')

        client.subscribe(SubTopic.CONNECTED_AMT, { qos: 0 })
        client.subscribe(SubTopic.MONITOR, { qos: 0 })

        connectedResolve()
    })
}

/* ------------------------ LISTENERS ------------------------ */

client.on('message', async (topic: string, messageBuf: Buffer) => {
    const message = messageBuf.toString()

    try {
        route(topic, message)
        updateUI()
    } catch (err) {
        console.error(err)
        delay(ERROR_MESSAGE_READ_DELAY)
    }
})

/* ------------------------ FUNCTIONS ----------------------- */

export function publish(topic: string, payload: string) {
    client.publish(topic, payload)
}

export function disconnect() {
    client.end()
}
