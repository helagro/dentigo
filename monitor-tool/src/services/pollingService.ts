import { publish, connected } from './mqttService'
import { PubTopic } from '../Topic'

import * as dotenv from 'dotenv'
import { getPromise } from '../freeze'
dotenv.config()

const SAMPLING_INTERVAL = parseInt(process.env.SAMPLING_INTERVAL ?? '1000')

export default async function poll() {
    await connected
    await getPromise()

    publish(PubTopic.BOOKING_STATS, '')
    publish(PubTopic.USER_STATS, '')

    setTimeout(poll, SAMPLING_INTERVAL)
}
