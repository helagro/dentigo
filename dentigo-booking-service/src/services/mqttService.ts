import * as mqtt from 'mqtt'
import * as dotenv from 'dotenv'
import 'reflect-metadata'
import { AppDataSource } from '../data-source'
import timeSlot from '../controllers/timeSlotController'
import { getTimeSlotDate } from '../utils'
import {
    decrypt,
    encryptAES,
    verifyDentist,
    verifyPatient,
} from './encryptionService'
import timeSlotService from '../services/timeSlotService'

dotenv.config()

const MQTT_BROKER_URI = process.env.MQTT_URI || 'mqtt://mqtt.jnsl.tk'
const MQTT_TOPIC = 'booking/#'

const client = mqtt.connect(MQTT_BROKER_URI)

/* --------------------------- DB --------------------------- */

try {
    AppDataSource.initialize()
    console.log('Connected to database')
} catch (err) {
    console.error(err)
}

/* ------------------------- CONNECT ------------------------ */

export function connect() {
    client.on('connect', () => {
        client.subscribe(MQTT_TOPIC, { qos: 2 })
        console.log(
            `Booking service listenting for messages on topic '${MQTT_TOPIC} from '${MQTT_BROKER_URI}'...`,
        )
    })
}

/* ------------------------ LISTEN -------------------------- */

client.on('message', async (topic: string, message: Buffer) => {
    try {
        switch (topic) {
            case 'booking/timeslot/get/all': {
                try {
                    const parsedMessage = JSON.parse(message.toString())
                    const res = await timeSlot.getAllTimeSlots()

                    console.log(res)

                    publish(
                        `clients/${parsedMessage.clientID}/booking/timeslot/get`,
                        res,
                        parsedMessage.publicKey,
                    )
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(message.toString())
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/get`,
                            err,
                        )
                    }
                }

                break
            }
            case 'booking/timeslot/get/byClinic': {
                try {
                    const parsedMessage = JSON.parse(message.toString())
                    const res =
                        await timeSlot.getTimeSlotByClinic(parsedMessage)

                    console.log(res)

                    publish(
                        `clients/${parsedMessage.clientID}/booking/timeslot/get`,
                        res,
                    )
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(message.toString())
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/get`,
                            err,
                        )
                    }
                }
                break
            }
            case 'booking/timeslot/get/byDentist': {
                try {
                    const parsedMessage = JSON.parse(message.toString())
                    const res =
                        await timeSlot.getTimeSlotByDentist(parsedMessage)

                    console.log(res)

                    publish(
                        `clients/${parsedMessage.clientID}/booking/timeslot/get`,
                        res,
                    )
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(message.toString())
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/get`,
                            err,
                        )
                    }
                }
                break
            }
            case 'booking/timeslot/status/booked': {
                const { content, keyAES } = decrypt(message.toString())
                try {
                    const parsedMessage = JSON.parse(content)
                    if (
                        await verifyDentist(
                            parsedMessage.dentistID,
                            parsedMessage.signature,
                        )
                    ) {
                        const res =
                            await timeSlot.getBookedSlotsByDentist(
                                parsedMessage,
                            )
                        console.log(res)

                        publish(
                            `clients/${parsedMessage.clientID}/timeslot/status`,
                            res,
                            keyAES,
                        )
                    } else {
                        handleError(
                            `clients/${parsedMessage.clientID}/timeslot/status`,
                            new Error('Could not authenticate dentist'),
                        )
                    }
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(content.toString())
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/status`,
                            err,
                        )
                    }
                }
                break
            }
            case 'booking/timeslot/status/cancelled': {
                const { content, keyAES } = decrypt(message.toString())
                try {
                    const parsedMessage = JSON.parse(content)
                    if (
                        await verifyDentist(
                            parsedMessage.dentistID,
                            parsedMessage.signature,
                        )
                    ) {
                        const res =
                            await timeSlot.getCancelledSlotsByDentist(
                                parsedMessage,
                            )
                        console.log(res)

                        publish(
                            `clients/${parsedMessage.clientID}/timeslot/status`,
                            res,
                            keyAES,
                        )
                    } else {
                        handleError(
                            `clients/${parsedMessage.clientID}/timeslot/status`,
                            new Error('Could not authenticate dentist'),
                        )
                    }
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(content.toString())
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/status`,
                            err,
                        )
                    }
                }
                break
            }
            case 'booking/timeslot/status/cancelled/dismiss': {
                const { content, keyAES } = decrypt(message.toString())
                try {
                    const parsedMessage = JSON.parse(content)
                    if (
                        await verifyDentist(
                            parsedMessage.dentistID,
                            parsedMessage.signature,
                        )
                    ) {
                        const res = await timeSlot.dismissCancel(
                            parsedMessage.dentistID,
                        )
                        console.log(res)

                        publish(
                            `clients/${parsedMessage.clientID}/timeslot/status`,
                            res,
                            keyAES,
                        )
                        publish('clients/timeslot/isUpdated', {
                            isUpdated: true,
                        })
                    } else {
                        handleError(
                            `clients/${parsedMessage.clientID}/timeslot/status`,
                            new Error('Could not authenticate dentist'),
                        )
                    }
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(content.toString())
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/status`,
                            err,
                        )
                    }
                }
                break
            }
            case 'booking/timeslot/create': {
                // if there's an encryption related error, there's not topic to respond to, error will be caught by global catch
                const { content, keyAES } = decrypt(message.toString())
                try {
                    const { clientID, dentistID, signature } =
                        JSON.parse(content)
                    if (await verifyDentist(dentistID, signature)) {
                        const res = await timeSlot.addNewTimeSlot(content)
                        const timeSlotDate = getTimeSlotDate(
                            res.timeSlotStart,
                            res.timeSlotEnd,
                        )
                        const notificationMessage = {
                            clinicID: res.clinicID,
                            timeslot: timeSlotDate,
                            dentistID: res.dentistID,
                        }
                        publish(
                            `clients/${clientID}/booking/timeslot/create`,
                            res,
                            keyAES,
                        )
                        publish(
                            `booking/releaseNewTimeslot`,
                            notificationMessage,
                        )
                        publish('clients/timeslot/isUpdated', {
                            isUpdated: true,
                        })
                    } else {
                        handleError(
                            `clients/${clientID}/booking/timeslot/create`,
                            new Error('Could not authenticate dentist'),
                        )
                    }
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(content)
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/create`,
                            err,
                        )
                    }
                }

                break
            }
            case 'booking/timeslot/book': {
                let content: string | undefined = null
                try {
                    content = decrypt(message.toString()).content
                } catch (err) {
                    console.error(err)
                    return
                }

                try {
                    const parsedMessage = JSON.parse(content)

                    if (
                        !(await verifyPatient(
                            parsedMessage.patientID,
                            parsedMessage.signature,
                        ))
                    ) {
                        throw new Error('Could not authenticate')
                    }

                    const res = await timeSlot.bookTimeSlot(content)
                    console.log(res)
                    const { timeSlotStart, timeSlotEnd, patientID } = res
                    const timeSlotDate = getTimeSlotDate(
                        timeSlotStart,
                        timeSlotEnd,
                    )
                    const notificationMessage = {
                        userID: patientID,
                        timeslot: timeSlotDate,
                        email: parsedMessage.email,
                    }

                    publish('booking/createBooking', notificationMessage)
                    publish('clients/timeslot/isUpdated', { isUpdated: true })
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(content)
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/create`,
                            err,
                        )
                    }
                }
                break
            }
            case 'booking/timeslot/unbook': {
                let content = null
                try {
                    content = decrypt(message.toString()).content
                } catch (err) {
                    console.error(err)
                    return
                }

                try {
                    const parsedMessage = JSON.parse(content)

                    if (
                        !(await verifyPatient(
                            parsedMessage.patientID,
                            parsedMessage.signature,
                        ))
                    ) {
                        throw new Error('Could not authenticate')
                    }

                    const res = await timeSlot.unbookTimeSlot(content)
                    const { timeSlotStart, timeSlotEnd } = res
                    const timeSlotDate = getTimeSlotDate(
                        timeSlotStart,
                        timeSlotEnd,
                    )
                    const notificationMessage = {
                        userID: parsedMessage.patientID,
                        timeslot: timeSlotDate,
                        email: parsedMessage.email,
                    }

                    publish('booking/cancelBooking', notificationMessage)
                    publish('clients/timeslot/isUpdated', { isUpdated: true })
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(content)
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/delete`,
                            err,
                        )
                    }
                }
                break
            }
            case 'booking/timeslot/cancel': {
                // if there's an encryption related error, there's no topic to respond to, error will be caught by global catch
                const { content, keyAES } = decrypt(message.toString())
                try {
                    const { clientID, dentistID, signature, timeSlotID } =
                        JSON.parse(content)
                    if (await verifyDentist(dentistID, signature)) {
                        const cancelledSlot =
                            await timeSlot.getTimeSlotByID(timeSlotID)

                        const res = await timeSlot.cancelTimeSlot(content)

                        if (
                            cancelledSlot.patientID != null ||
                            cancelledSlot.patientID !==
                                timeSlotService.CANCELLED_FLAG
                        ) {
                            const timeSlotDate = getTimeSlotDate(
                                cancelledSlot.timeSlotStart,
                                cancelledSlot.timeSlotEnd,
                            )
                            const cancelNotificationMsg = {
                                userID: cancelledSlot.patientID,
                                timeslot: timeSlotDate,
                            }

                            console.log(cancelNotificationMsg)

                            publish(
                                'booking/cancelBooking',
                                cancelNotificationMsg,
                            )
                        }

                        const message = {
                            dentistID: dentistID,
                            bookingID: timeSlotID,
                            isSuccessful: res,
                        }

                        console.log(message)

                        publish(
                            `clients/${clientID}/booking/timeslot/cancel`,
                            message,
                            keyAES,
                        )
                        publish('clients/timeslot/isUpdated', {
                            isUpdated: true,
                        })
                    } else {
                        handleError(
                            `clients/${clientID}/booking/timeslot/cancel`,
                            new Error('Could not authenticate dentist'),
                        )
                    }
                } catch (err) {
                    if (err instanceof SyntaxError) {
                        // Bad JSON format, no topic to send error to
                        console.error(err)
                    } else {
                        const parsedMessage = JSON.parse(content)
                        handleError(
                            `clients/${parsedMessage.clientID}/booking/timeslot/cancel`,
                            err,
                        )
                    }
                }

                break
            }
            case 'booking/statistics': {
                try {
                    const timeSlotStats = await timeSlotService.getStatistics()
                    publish(`monitor/statistics/booking`, timeSlotStats)
                } catch (err) {
                    console.error(err)
                }
            }
        }
    } catch (err) {
        console.error(err)
    }
})

/* ------------------------- PUBLISH ------------------------ */

export const publish = (topic: string, payload: object, publicKey?: Buffer) => {
    const message: string = JSON.stringify(payload)
    if (publicKey) {
        const buffer = encryptAES(message, publicKey)
        client.publish(topic, buffer)
    } else client.publish(topic, message)
}

/* --------------------- ERROR HANDLING --------------------- */

export const handleError = (topic: string, err: Error) => {
    const payload = {
        message: err.message,
        failed: true,
    }
    publish(topic, payload)
    console.error(err)
}
