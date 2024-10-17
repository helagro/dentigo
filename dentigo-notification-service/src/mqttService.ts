import * as mqtt from 'mqtt'
import { EventEmitter } from 'events'

export const MQTT_SUB_TOPIC_BOOKING = 'booking'
export const MQTT_SUB_TOPIC_PATIENTUI = 'patientUI'
export const MQTT_SUB_TOPIC_CLINIC = 'clinic'
export const MQTT_PUB_TOPIC = 'notifications'
const QOS = 1
const BROKER_URL = process.env.BROKER_URL ?? 'wss://mqtt.jnsl.tk'

type MyEventEmitter = EventEmitter & {
    emit: (event: 'mqttMessage', message: string) => boolean
}
const eventEmitter: MyEventEmitter = new EventEmitter()

const client = mqtt.connect(BROKER_URL)

export const setUpMqtt = (): void => {
    client.on('connect', () => {
        console.log('Connected to mqtt broker.')
        client.subscribe(
            [
                `${MQTT_SUB_TOPIC_BOOKING}/#`,
                `${MQTT_SUB_TOPIC_PATIENTUI}/#`,
                `${MQTT_SUB_TOPIC_CLINIC}/#`,
            ],
            { qos: QOS },
            err => {
                if (!err) {
                    console.log(
                        `Notification service listening for message on topic '${MQTT_SUB_TOPIC_BOOKING}/#', '${MQTT_SUB_TOPIC_PATIENTUI}/#', '${MQTT_SUB_TOPIC_CLINIC}/#'`,
                    )
                }
            },
        )
    })
    client.on('message', (topic, message) => {
        console.log(`Receive topic - ${topic}, message - ${message.toString()}`)
        eventEmitter.emit('mqttMessage', {
            topic: topic,
            message: message.toString(),
        })
    })
}

export const publishMessage = (message: string | Buffer, topic: string) => {
    client.publish(topic, message)
    console.log('message published: ', topic, message)
}

export const disconnectMqtt = () => {
    console.log('Disconnecting MQTT client...')

    return new Promise<void>(resolve => {
        client.end(() => {
            resolve()
        })

        console.log('MQTT client disconnected.')
    })
}

export { eventEmitter }
