import { useMQTT } from 'mqtt-vue-hook'
import type { SubscribeOptions, PublishOptions } from './mqttTypes'

// TYPES
type QoS = 0 | 1 | 2

// CONSTANTS
const TIMEOUT_MESSAGE = 'MQTT Request timed out'
const TIMEOUT_MS = 7000

const BROKER_ADDRESS =
    import.meta.env.VUE_APP_BROKER_ADDRESS || 'wss://mqtt.jnsl.tk'

// VARIABLES
const mqttHook = useMQTT()
const clientID = crypto.randomUUID()

/* ----------------------- CONNECTION ----------------------- */

connect()

export function connect() {
    mqttHook
        .connect(BROKER_ADDRESS, {
            clean: false,
            keepalive: 10,
            clientId: `mqtt_client_${Math.random()
                .toString(16)
                .substring(2, 10)}`,
            connectTimeout: TIMEOUT_MS,
        })
        .then(() => {
            console.log(`connected ${BROKER_ADDRESS}`)
        })
        .catch(err => {
            console.log(err)
        })
}

export function disconnect() {
    mqttHook.disconnect()
}

/* ------------------------- PUBLISH ------------------------ */

export function publish(
    topic: string,
    message: string,
    qos: QoS,
    options: PublishOptions | undefined,
    callback: () => void,
) {
    mqttHook.publish(topic, message, qos, options, callback)
}

/* ------------------------- SUBSCRIBE ------------------------ */

export function subscribe(
    topics: string[],
    qos: QoS,
    options: SubscribeOptions | undefined,
    callback: (err: Error, granted: unknown) => void,
) {
    mqttHook.subscribe(topics, qos, options, callback)
}

export function unsubscribe(topic: string) {
    mqttHook.unSubscribe(topic)
}

/* ------------------------- EVENTS ------------------------ */

export function registerEvent(
    topic: string,
    callback: (topic: string, message: string) => void,
) {
    mqttHook.registerEvent(topic, callback)
}

export function unRegisterEvent(topic: string) {
    mqttHook.unRegisterEvent(topic)
}

/* ---------------------- REQUEST ---------------------- */

/** @throws {Error} */
export async function requestJSON(
    pubTopic: string,
    subTopic: string,
    payload: object,
    qos: QoS,
) {
    const response = await request(pubTopic, subTopic, payload, qos)
    return JSON.parse(response.toString())
}

/** @throws {Error} */
export function request(
    pubTopic: string,
    subTopic: string,
    payload: object | string,
    qos: QoS,
): Promise<string | Uint8Array> {
    subTopic = subTopic.replace('$ID', clientID)

    return new Promise((resolve, reject) => {
        const timeOut = setTimeout(() => {
            reject(TIMEOUT_MESSAGE)
        }, TIMEOUT_MS)

        subscribe([subTopic], qos, undefined, (err: Error) => {
            clearTimeout(timeOut)

            if (err) {
                console.error(`Could not request from ${subTopic}: ${err}`)
                reject('subscribe error')
                return
            }

            requestOnSubscribed(
                pubTopic,
                subTopic,
                payload,
                qos,
                resolve,
                reject,
            )
        })
    })
}

function requestOnSubscribed(
    pubTopic: string,
    subTopic: string,
    payload: object | string,
    qos: QoS,
    resolve: (value: string | PromiseLike<string>) => void,
    reject: (value: string | PromiseLike<string>) => void,
) {
    const timeOut = setTimeout(() => {
        reject(TIMEOUT_MESSAGE)
        unsubscribe(subTopic)
        unRegisterEvent(subTopic)
    }, TIMEOUT_MS)

    registerEvent(subTopic, (topic, message) => {
        clearTimeout(timeOut)

        resolve(message)
        unsubscribe(topic)
        unRegisterEvent(topic)
    })

    if (typeof payload !== 'string') payload = processPayload(payload)
    publish(pubTopic, payload, qos, undefined, () => {})
}

function processPayload(payload: object): string {
    payload = { ...payload, clientID }
    return JSON.stringify(payload)
}

/* ---------------------- LISTEN ---------------------- */

export function listen(
    topic: string,
    qos: QoS,
    options: SubscribeOptions | undefined,
    callback: (topic: string, message: string | Uint8Array) => void,
) {
    topic = topic.replace('$ID', clientID)

    subscribe([topic], qos, options, (err: Error) => {
        if (err) {
            console.error(`Could not listen to ${topic}: ${err}`)
        } else {
            console.log(`Listening to ${topic}`)
            registerEvent(topic, callback)
        }
    })
}

export function unListen(topic: string) {
    unsubscribe(topic)
    unRegisterEvent(topic)
}

/* -------------------------- OTHER ------------------------- */

export function getID() {
    return clientID
}

export class ResponseMQTT {
    message: string
    statusCode: number

    constructor(statusCode: number, message: string) {
        this.statusCode = statusCode
        this.message = message
    }

    isSuccess() {
        return this.statusCode >= 200 && this.statusCode < 300
    }
}
