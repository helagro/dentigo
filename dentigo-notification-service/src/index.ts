import 'dotenv/config'
import { disconnectMqtt, setUpMqtt } from './mqttService'
import { eventEmitter } from './mqttService'
import { EventEmitter } from 'events'
import { processMqttMessage } from './processors/mqttProcessor'
import { createDatabaseConnection } from './database/database'

const main = async () => {
    try {
        // Set up mqtt
        setUpMqtt()
        // Set up database connection
        await createDatabaseConnection()
        // Event emitter for mqtt message
        ;(eventEmitter as EventEmitter).on(
            'mqttMessage',
            async ({ topic, message }) => {
                console.log(
                    'Event listner triggered, received MQTT message: ',
                    topic,
                )
                await processMqttMessage({ topic, mqttMessage: message })
            },
        )
        // Disconnect mqtt when receiving termination signal
        process.on('SIGINT', async () => {
            console.log('Received SIGINT.')
            await disconnectMqtt()
            process.exit(0)
        })
    } catch (err) {
        console.error('Error during initialization: ', err)
        process.exit(1)
    }
}

main()
