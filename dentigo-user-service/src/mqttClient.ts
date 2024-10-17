import * as mqtt from 'mqtt'
import { getNumberOfClientsAuthenticating, initAuth } from './bankId'
import { decrypt, encryptAES } from './encryption'
import * as dotenv from 'dotenv'

dotenv.config()

const MQTT_BROKER_URI = process.env.MQTT_URI || 'wss://mqtt.jnsl.tk'
const MQTT_TOPIC = 'users/#'

const client = mqtt.connect(MQTT_BROKER_URI)

/* ------------------------- CONNECT ------------------------ */

export function connect() {
    client.on('connect', () => {
        client.subscribe(MQTT_TOPIC, { qos: 1 })
        console.log(
            `User service listenting for messages on topic '${MQTT_TOPIC} from '${MQTT_BROKER_URI}'...`,
        )
    })
}

/* ------------------------ LISTEN -------------------------- */

client.on('message', async (topic: string, message: Buffer) => {
    if (topic === 'users/statistics') {
        publish('monitor/statistics/user', {
            numberOfClientsAuthenticating: getNumberOfClientsAuthenticating(),
        })
        return
    }

    try {
        const decrypted = decrypt(message.toString())
        const parsedMessage = JSON.parse(decrypted.content)

        switch (topic) {
            case 'users/auth/init': {
                if (!parsedMessage.ip) throw new Error('No IP provided')
                if (parsedMessage.clientID == null)
                    throw new Error('No clientID provided')

                const res = await initAuth(
                    parsedMessage.clientID,
                    parsedMessage.ip,
                    decrypted.keyAES,
                )

                publish(
                    `clients/${parsedMessage.clientID}/auth/init`,
                    res,
                    decrypted.keyAES,
                )

                break
            }
            default: {
                console.log('Received message on unknown topic: ', topic)
            }
        }
    } catch (err) {
        console.error('Error: ', err.message, message.toString())
    }
})

/* ------------------------- PUBLISH ------------------------ */

export const publish = (topic: string, payload: object, key?: Buffer) => {
    const message: string = JSON.stringify(payload)
    if (key) {
        const encrypted = encryptAES(message, key)
        client.publish(topic, encrypted)
    } else client.publish(topic, message)
}
