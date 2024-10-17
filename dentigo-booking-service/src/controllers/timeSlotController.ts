import { AppDataSource } from '../data-source'
import { TimeSlot } from '../entity/TimeSlot'
import timeSlotService from '../services/timeSlotService'
import { getByClinicMessage, getByDentistMessage } from '../types/MQTTTypes'

const timeSlotRepository = AppDataSource.getRepository(TimeSlot)

async function getAllTimeSlots(): Promise<Array<TimeSlot>> {
    const allTimeSlots = await timeSlotRepository.find()
    if (!allTimeSlots.length || allTimeSlots.length == 0) {
        throw new Error('No timeslots were found')
    }
    return allTimeSlots
}

async function getTimeSlotByClinic(
    message: getByClinicMessage,
): Promise<object> {
    const timeSlotArray = await timeSlotService.getTimeSlotsBy({
        clinicID: message.clinicID,
    })
    return {
        clinicID: message.clinicID,
        timeSlots: timeSlotArray,
    }
}

async function getTimeSlotByDentist(
    message: getByDentistMessage,
): Promise<object> {
    const timeSlotArray = await timeSlotService.getTimeSlotsBy({
        dentistID: message.dentistID,
    })
    return {
        dentistID: message.dentistID,
        timeSlots: timeSlotArray,
    }
}

async function getTimeSlotByID(timeSlotID: string): Promise<TimeSlot> {
    const timeSlotArray = await timeSlotService.getTimeSlotsBy({
        id: timeSlotID,
    })

    return timeSlotArray[0]
}

async function getBookedSlotsByDentist(
    message: getByDentistMessage,
): Promise<object> {
    const bookedSlots = await timeSlotService.getBookedSlotsByDentist(
        message.dentistID,
    )

    return {
        dentistID: message.dentistID,
        timeSlots: bookedSlots,
    }
}

async function getCancelledSlotsByDentist(
    message: getByDentistMessage,
): Promise<object> {
    const cancelledSlots = await timeSlotService.getCancelledSlotsByDentist(
        message.dentistID,
    )

    return {
        dentistID: message.dentistID,
        timeSlots: cancelledSlots,
    }
}

// Passes the message to timeSlotService, and saves the returned entity
async function addNewTimeSlot(message: string): Promise<TimeSlot> {
    const newTimeSlot = timeSlotService.createTimeSlot(message)
    const savedTimeSlot = await timeSlotRepository.save(newTimeSlot)
    return savedTimeSlot
}

async function bookTimeSlot(message: string): Promise<TimeSlot> {
    return timeSlotService.bookTimeSlot(message)
}

async function unbookTimeSlot(message: string): Promise<TimeSlot> {
    return timeSlotService.unbookTimeSlot(message)
}

async function cancelTimeSlot(message: string): Promise<boolean> {
    const res = await timeSlotService.removeTimeSlot(message)
    return res
}

async function dismissCancel(dentistID: string): Promise<object> {
    const confirm =
        await timeSlotService.dismissCancelledSlotsByDentist(dentistID)
    return {
        message: confirm,
    }
}

export default {
    getAllTimeSlots,
    getTimeSlotByClinic,
    getTimeSlotByDentist,
    getTimeSlotByID,
    getBookedSlotsByDentist,
    getCancelledSlotsByDentist,
    addNewTimeSlot,
    bookTimeSlot,
    unbookTimeSlot,
    cancelTimeSlot,
    dismissCancel,
}
