import { Repository } from 'typeorm'
import { AppDataSource } from '../data-source'
import { TimeSlot } from '../entity/TimeSlot'

const CANCELLED_FLAG = '<CANCELLED>'

const timeSlotRepository: Repository<TimeSlot> =
    AppDataSource.getRepository(TimeSlot)

// This method takes an MQTT message and returns a timeslot
function createTimeSlot(message: string): TimeSlot {
    const { clientID, timeSlotStart, timeSlotEnd, dentistID, clinicID } =
        JSON.parse(message)
    if (!(clientID && timeSlotStart && timeSlotEnd && clinicID && dentistID)) {
        throw new Error('All fields are required!')
    }
    const newTimeSlot = timeSlotRepository.create({
        timeSlotStart: timeSlotStart,
        timeSlotEnd: timeSlotEnd,
        clinicID: clinicID,
        dentistID: dentistID,
    })

    return newTimeSlot
}

async function bookTimeSlot(message: string): Promise<TimeSlot> {
    const { timeSlotID, patientID } = JSON.parse(message)
    validateTimeSlotModificationParams(timeSlotID, patientID)

    const { timelotPromise, promiseResolve, promiseReject } =
        generatePromiseWrapper()

    timeSlotRepository.manager.transaction(async manager => {
        const timeSlot = await manager.findOne(TimeSlot, {
            where: {
                id: timeSlotID,
            },
        })

        if (!timeSlot) {
            promiseReject('Time slot not found!')
        } else if (timeSlot.patientID && timeSlot.patientID != CANCELLED_FLAG) {
            promiseReject('Time slot already booked!')
        } else {
            timeSlot.patientID = patientID
            await manager.save(timeSlot)
            promiseResolve(timeSlot)
        }
    })

    return timelotPromise
}

async function unbookTimeSlot(message: string): Promise<TimeSlot> {
    const { timeSlotID, patientID } = JSON.parse(message)
    validateTimeSlotModificationParams(timeSlotID, patientID)

    const { timelotPromise, promiseResolve, promiseReject } =
        generatePromiseWrapper()

    timeSlotRepository.manager.transaction(async manager => {
        const timeSlot = await manager.findOne(TimeSlot, {
            where: {
                id: timeSlotID,
            },
        })

        if (!timeSlot) {
            promiseReject('Found no time slot with id!')
        } else if (timeSlot.patientID != patientID)
            promiseReject('Wrong patient ID!')
        else {
            timeSlot.patientID = CANCELLED_FLAG
            await manager.save(timeSlot)
            promiseResolve(timeSlot)
        }
    })

    return timelotPromise
}

async function removeTimeSlot(message: string): Promise<boolean> {
    const { timeSlotID } = JSON.parse(message)

    const result = await timeSlotRepository
        .createQueryBuilder('timeSlots')
        .delete()
        .from(TimeSlot)
        .where('id = :id', { id: timeSlotID })
        .execute()

    if (result.affected == 0) {
        const timeslot = await getTimeSlotsBy({
            id: timeSlotID,
        })

        if (timeslot.length == 0) throw new Error('Found no time slot with id!')
        else throw new Error('Wrong patient ID!')
    } else {
        return true
    }
}

async function getTimeSlotsBy(condition: object): Promise<Array<TimeSlot>> {
    const timeSlots = await timeSlotRepository.find({
        where: condition,
    })

    return timeSlots
}

async function getBookedSlotsByDentist(
    dentistID: string,
): Promise<Array<TimeSlot>> {
    const result = await timeSlotRepository
        .createQueryBuilder('timeSlot')
        .where('timeSlot.dentistID = :dentistID', { dentistID: dentistID })
        .andWhere('timeSlot.patientID IS NOT NULL')
        .andWhere('timeSlot.patientID != :flag', { flag: CANCELLED_FLAG })
        .execute()

    if (result.affected == 0) {
        throw new Error('No time slots found')
    } else {
        return result
    }
}

async function getCancelledSlotsByDentist(
    dentistID: string,
): Promise<Array<TimeSlot>> {
    const result = await timeSlotRepository
        .createQueryBuilder('timeSlot')
        .where('timeSlot.dentistID = :dentistID', { dentistID: dentistID })
        .andWhere('timeSlot.patientID = :patientID', {
            patientID: CANCELLED_FLAG,
        })
        .execute()

    if (result.affected == 0) {
        throw new Error('No time slots found')
    } else {
        return result
    }
}

async function dismissCancelledSlotsByDentist(
    dentistID: string,
): Promise<string> {
    const result = await timeSlotRepository
        .createQueryBuilder()
        .update(TimeSlot)
        .set({
            patientID: null,
        })
        .where('dentistID = :dentistID', { dentistID: dentistID })
        .andWhere('patientID = :patientID', {
            patientID: CANCELLED_FLAG,
        })
        .returning('*')
        .execute()

    if (result.affected == 0) {
        throw new Error('No cancellations to dismiss')
    } else {
        return 'Successfully dismissed all cancellations'
    }
}

/* ----------------------- STATISTICS ----------------------- */

async function getStatistics() {
    return {
        countBooked: await getBookedCount(),
        countAvailable: await getAvailableCount(),
    }
}

async function getBookedCount(): Promise<number> {
    return (
        await timeSlotRepository
            .createQueryBuilder('timeSlot')
            .select('count(*)', 'count')
            .andWhere('timeSlot.patientID IS NOT NULL')
            .andWhere('timeSlot.patientID != :flag', { flag: CANCELLED_FLAG })
            .execute()
    )[0].count
}

async function getAvailableCount(): Promise<number> {
    return (
        await timeSlotRepository
            .createQueryBuilder('timeSlot')
            .select('count(*)', 'count')
            .orWhere('timeSlot.patientID IS NULL')
            .orWhere('timeSlot.patientID = :flag', { flag: CANCELLED_FLAG })
            .execute()
    )[0].count
}

/* ------------------------ UTILITIES ----------------------- */

function validateTimeSlotModificationParams(
    timeSlotID: string,
    patientID: string,
) {
    if (!timeSlotID) throw new Error(`Time slot ID is invalid: ${timeSlotID}`)
    if (!patientID || patientID == CANCELLED_FLAG)
        throw new Error('Patient ID is invalid: ' + patientID)
}

function generatePromiseWrapper() {
    let promiseResolve: (reason?: TimeSlot) => void
    let promiseReject: (reason?: string) => void
    const timelotPromise = new Promise<TimeSlot>((resolve, reject) => {
        promiseResolve = resolve
        promiseReject = reject
    })

    return { timelotPromise, promiseResolve, promiseReject }
}

/* ------------------------- EXPORT ------------------------- */

export default {
    CANCELLED_FLAG,
    createTimeSlot,
    bookTimeSlot,
    unbookTimeSlot,
    removeTimeSlot,
    getTimeSlotsBy,
    getBookedSlotsByDentist,
    getCancelledSlotsByDentist,
    dismissCancelledSlotsByDentist,
    getStatistics,
}
