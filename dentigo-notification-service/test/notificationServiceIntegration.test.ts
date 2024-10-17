import {
    setUpMqtt,
    disconnectMqtt,
    publishMessage,
    eventEmitter,
} from '../src/mqttService'
import { EventEmitter } from 'events'
import { createDatabaseConnection } from '../src/database/database'
import { processMqttMessage } from '../src/processors/mqttProcessor'
import { Notification } from '../src/entities/Notification'
import { ClinicNotificationSubscription } from '../src/entities/ClinicNotificationSubscription'
import { v4 as uuidv4 } from 'uuid'

/** The integration test consists of MQTT interacting with 2 different tables in the database */
describe('Notification Service Integration Tests', () => {
    beforeAll(async () => {
        // Set up database connections before running the tests
        await createDatabaseConnection()
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
    })

    beforeEach(async () => {
        await setUpMqtt()
    })

    afterAll(async () => {
        await disconnectMqtt()
    })

    it('should process MQTT messages for new bookings and create notifications in the database', async () => {
        const uniqueUserID = uuidv4()
        // Simulate an MQTT message
        const publishingMessage = {
            topic: 'booking/createBooking',
            mqttMessage: `${JSON.stringify({
                userID: uniqueUserID,
                timeslot: '20 januari 2024 kl. 10:00 - 12:00',
                email: `testUser${uniqueUserID.slice(0, 4)}@gmail.com`,
            })}`,
        }
        await new Promise(resolve => setTimeout(resolve, 1000))

        publishMessage(publishingMessage.mqttMessage, publishingMessage.topic)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const message = `Your booking for ${
            JSON.parse(publishingMessage.mqttMessage).timeslot
        } has been successful.`

        const storedNotification = await Notification.findOne({
            where: {
                message: message,
                userId: JSON.parse(publishingMessage.mqttMessage).userID,
            },
        })
        expect(storedNotification).not.toBe(null)
        expect(storedNotification?.userId).toEqual(
            JSON.parse(publishingMessage.mqttMessage).userID,
        )
        expect(storedNotification?.email).toEqual(
            JSON.parse(publishingMessage.mqttMessage).email,
        )
    })

    it('should process MQTT meesages for subscribing to new time slots and store in the database', async () => {
        const uniqueClinicID = uuidv4()
        const publishingMessage = {
            topic: 'patientUI/subscribeNewTimeslot',
            mqttMessage: `${JSON.stringify({
                clinicID: uniqueClinicID,
                email: `testClinic${uniqueClinicID.slice(0, 4)}@hotmail.com`,
            })}`,
        }
        await new Promise(resolve => setTimeout(resolve, 1000))

        publishMessage(publishingMessage.mqttMessage, publishingMessage.topic)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const storedSubscription = await ClinicNotificationSubscription.findOne(
            {
                where: {
                    clinicId: JSON.parse(publishingMessage.mqttMessage)
                        .clinicID,
                    userEmail: JSON.parse(publishingMessage.mqttMessage).email,
                },
            },
        )
        expect(storedSubscription).not.toBe(null)
        expect(storedSubscription?.id).not.toBe(null)
    })
})
