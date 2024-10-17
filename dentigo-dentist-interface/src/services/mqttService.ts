import * as mqtt from 'mqtt'
import * as dotenv from 'dotenv'
import 'reflect-metadata'
import { resolveResponse } from '../requestManager.js'
import { store } from './loginService.js'

dotenv.config()

const MQTT_BROKER_URI = process.env.MQTT_URI || 'mqtt://mqtt.jnsl.tk'

const MQTT_TOPIC = 'clients/#'

const client = mqtt.connect(MQTT_BROKER_URI)

/* ------------------------- CONNECT ------------------------ */

export function connect() {
    client.on('connect', () => {
        store.clientID = crypto.randomUUID()
        client.subscribe(MQTT_TOPIC, { qos: 2 })
    })
}

client.on('message', async (topic: string, message: Buffer) => {
    resolveResponse(message.toString())
})

export function publish(topic: string, payload: string) {
    client.publish(topic, payload)
}

export function disconnect() {
    client.end()
}
