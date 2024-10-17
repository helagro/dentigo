import { decrypt, encrypt, downloadKey } from './encryptionService.js'
import * as mqttService from '../services/mqttService.js'
import { getResponse } from '../requestManager.js'
import { store } from './loginService.js'
import { TimeSlot } from '../types/types.js'
import { getTimeSlotDate } from '../utils.js'

type newSlotAnswers = {
    startDate: string
    endDate: string
}

/**
 * @throws {Error} if the mqtt response indicates failure
 */
export async function createNewTimeSlot(
    answers: newSlotAnswers,
): Promise<string> {
    const message = {
        clientID: store.clientID,
        timeSlotStart: answers.startDate,
        timeSlotEnd: answers.endDate,
        dentistID: store.dentistID,
        clinicID: store.clinicID,
        signature: store.signature,
    }
    const publicKey = await downloadKey('bookingServiceEncrypt')
    const encrypted = encrypt(JSON.stringify(message), publicKey)
    mqttService.publish('booking/timeslot/create', encrypted)

    const mqttRes = await getResponse()

    let unencryptedPayload: { failed: string; message: string } | undefined
    try {
        unencryptedPayload = JSON.parse(mqttRes)
    } catch (err) {
        return decrypt(mqttRes)
    }

    if (unencryptedPayload?.failed) throw new Error(unencryptedPayload.message)
    else return mqttRes // Should not happen
}

export async function getAllTimeSlots() {
    const message = {
        clientID: store.clientID,
        dentistID: store.dentistID,
    }

    mqttService.publish(
        'booking/timeslot/get/byDentist',
        JSON.stringify(message),
    )

    const mqttRes = await getResponse()

    return JSON.parse(mqttRes)
}

export async function getAllBookedSlots(): Promise<string> {
    const message = {
        clientID: store.clientID,
        dentistID: store.dentistID,
        signature: store.signature,
    }

    const publicKey = await downloadKey('bookingServiceEncrypt')
    const encrypted = encrypt(JSON.stringify(message), publicKey)
    mqttService.publish('booking/timeslot/status/booked', encrypted)

    const mqttRes = await getResponse()

    return decrypt(mqttRes)
}

export async function getAllCancelledSlots(): Promise<string> {
    const message = {
        clientID: store.clientID,
        dentistID: store.dentistID,
        signature: store.signature,
    }

    const publicKey = await downloadKey('bookingServiceEncrypt')
    const encrypted = encrypt(JSON.stringify(message), publicKey)
    mqttService.publish('booking/timeslot/status/cancelled', encrypted)

    const mqttRes = await getResponse()

    return decrypt(mqttRes)
}

export async function dismissCancelledSlots(): Promise<string> {
    const message = {
        clientID: store.clientID,
        dentistID: store.dentistID,
        signature: store.signature,
    }

    const publicKey = await downloadKey('bookingServiceEncrypt')
    const encrypted = encrypt(JSON.stringify(message), publicKey)
    mqttService.publish('booking/timeslot/status/cancelled/dismiss', encrypted)

    const mqttRes = await getResponse()

    return decrypt(mqttRes)
}

export async function cancelTimeSlot(timeSlotID: string): Promise<string> {
    const message = {
        clientID: store.clientID,
        dentistID: store.dentistID,
        signature: store.signature,
        timeSlotID: timeSlotID,
    }

    const publicKey = await downloadKey('bookingServiceEncrypt')
    const encrypted = encrypt(JSON.stringify(message), publicKey)
    mqttService.publish('booking/timeslot/cancel', encrypted)

    const mqttRes = await getResponse()

    return decrypt(mqttRes)
}

export function mapTimeSlotDates(timeSlots: Array<TimeSlot>): Array<object> {
    const dates = timeSlots.map((timeSlot: TimeSlot) => {
        return {
            name: getTimeSlotDate(timeSlot.timeSlotStart, timeSlot.timeSlotEnd),
            value: timeSlot.id,
        }
    })
    return dates
}

export function mapBookedSlots(
    timeSlots: Array<TimeSlot>,
): Map<string, boolean> {
    const isBookedMap = new Map()
    timeSlots.forEach((timeSlot: TimeSlot) => {
        isBookedMap.set(
            timeSlot.id,
            timeSlot.patientID == null || timeSlot.patientID === '<CANCELLED>'
                ? false
                : true,
        )
    })
    return isBookedMap
}
