import * as mqttModule from '../mqtt'
import { type TimeSlot } from '../../entities/TimeSlot'
import { type Dentist } from '../../entities/Dentist'
import Clinic from '../../entities/Clinic'
import { ref } from 'vue'

//================Get time slots==============//
export async function getTimeSlots(dentistID: string) {
    // get all or get by dentistID
    let pubTopic = 'booking/timeslot/get/byDentist' // get time slots by dentistID
    if (dentistID == 'all') {
        pubTopic = 'booking/timeslot/get/all' // get all time slots
    }
    const timeSlots = ref<TimeSlot[]>([])
    const payloadMessage = {
        dentistID: dentistID,
        clientID: 'PatientUI',
    }
    try {
        const response = await mqttModule.request(
            pubTopic,
            `clients/${payloadMessage.clientID}/booking/timeslot/get`,
            JSON.stringify(payloadMessage),
            2,
        )

        try {
            if (dentistID == 'all') {
                timeSlots.value = JSON.parse(response as string)
            } else {
                timeSlots.value = JSON.parse(response as string).timeSlots
            }

            // Filter out time slots that end before the current time
            timeSlots.value = getFilteredTimeSlots(timeSlots.value, null, null)

            // Use the dateFormatConversion function to convert date formats
            return dateFormatConversion(timeSlots.value)
        } catch (error) {
            console.error(`Error parsing MQTT message: ${error}`)
        }
    } catch (error) {
        console.error(`Error during MQTT request: ${error}`)
    }
}

//================Get filtered time slots==============//
export function getFilteredTimeSlots(
    timeSlots: TimeSlot[],
    startDate: Date | null,
    endDate: Date | null,
) {
    // Apply filters based on startDate and endDate
    const filteredTimeSlots = timeSlots.filter(timeSlot => {
        const timeSlotStart = new Date(timeSlot.timeSlotStart)
        const timeSlotEnd = new Date(timeSlot.timeSlotEnd)
        const currentTime = new Date()

        // Filter out time slots that end before the current time
        if (timeSlotStart < currentTime) {
            return false
        }

        if (startDate && endDate) {
            // Both startDate and endDate are provided
            return timeSlotStart >= startDate && timeSlotEnd <= endDate
        } else if (startDate) {
            // Only startDate is provided
            return timeSlotStart >= startDate
        } else if (endDate) {
            // Only endDate is provided
            return timeSlotEnd <= endDate
        }

        // If neither startDate nor endDate is provided, include all timeSlots
        return true
    })

    // Sort the filtered time slots by start time in ascending order
    const sortedTimeSlots = filteredTimeSlots.sort((a, b) => {
        const startTimeA = new Date(a.timeSlotStart).getTime()
        const startTimeB = new Date(b.timeSlotStart).getTime()
        return startTimeA - startTimeB
    })

    return sortedTimeSlots
}

//======================Get dentists====================//
export async function getDentists(dentistIDs: unknown) {
    // get all or get by dentistID or get by dentistIDs
    let pubTopic = 'clinic/dentists/get'
    let subTopic = 'clinic/dentists/get/response'
    if (dentistIDs == 'all') {
        pubTopic = 'clinic/dentists/get/all'
        subTopic = 'clinic/dentists/get/all/response'
    }
    try {
        const response = await mqttModule.request(
            pubTopic,
            subTopic,
            JSON.stringify({ dentistIDs: dentistIDs }),
            2,
        )

        try {
            return JSON.parse(response as string)
        } catch (error) {
            console.error(`Error parsing MQTT message: ${error}`)
        }
    } catch (error) {
        console.error(`Error during MQTT request: ${error}`)
    }
}

//======================Get filtered list of dentists====================//
export async function getFilteredDentists(
    startDate: Date | null,
    endDate: Date | null,
) {
    const timeSlots = ref<TimeSlot[]>([])
    try {
        timeSlots.value = (await getTimeSlots('all')) || []

        // Get filtered timeSlots based on startDate and endDate
        const filteredTimeSlots = getFilteredTimeSlots(
            timeSlots.value,
            startDate,
            endDate,
        )

        if (filteredTimeSlots.length === 0) {
            return []
        }
        // Extract dentist IDs from filteredTimeSlots
        const dentistIDs = Array.from(
            new Set(filteredTimeSlots.map(timeSlot => timeSlot.dentistID)),
        )

        // Get list of dentists by dentistIDs
        return getDentists(dentistIDs)
    } catch (error) {
        console.error(`Error in getFilteredDentists: ${error}`)
    }
}

//======================Filter dentists by clinic====================//
export async function filterDentistsByClinic(
    dentists: Dentist[],
    clinic: Clinic,
) {
    try {
        const filteredDentists = dentists.filter(
            dentist => dentist.clinicID === clinic.id,
        )

        return filteredDentists
    } catch (error) {
        console.error(`Error in filterDentistsByClinic: ${error}`)
        throw error
    }
}

//======================Get clinics====================//
export async function getClinics(clinicIDs: unknown) {
    // get all or get by clinicID or get by clinicIDs
    let pubTopic = 'clinic/clinics/get'
    let subTopic = 'clinic/clinics/get/response'
    if (clinicIDs == 'all') {
        pubTopic = 'clinic/clinics/get/all'
        subTopic = 'clinic/clinics/get/all/response'
    }
    try {
        const response = await mqttModule.request(
            pubTopic,
            subTopic,
            JSON.stringify({ clinicIDs: clinicIDs }),
            2,
        )

        try {
            const clinicsData = JSON.parse(response as string)
            const clinics: Clinic[] = []

            for (const clinicData of clinicsData) {
                clinics.push(
                    new Clinic(
                        clinicData.id,
                        clinicData.latitude,
                        clinicData.longitude,
                        clinicData.title,
                        clinicData.timeslots,
                        clinicData.dentistName,
                    ),
                )
            }

            return clinics
        } catch (error) {
            console.error(`Error parsing MQTT message: ${error}`)
        }
    } catch (error) {
        console.error(`Error during MQTT request: ${error}`)
    }
}

//======================Get filtered list of clinics====================//
export async function getFilteredClinics(
    startDate: Date | null,
    endDate: Date | null,
) {
    const timeSlots = ref<TimeSlot[]>([])
    try {
        timeSlots.value = (await getTimeSlots('all')) || []

        // Get filtered timeSlots based on startDate and endDate
        const filteredTimeSlots = getFilteredTimeSlots(
            timeSlots.value,
            startDate,
            endDate,
        )

        if (filteredTimeSlots.length === 0) {
            return []
        }
        // Extract clinic IDs from filteredTimeSlots
        const clinicIDs = Array.from(
            new Set(filteredTimeSlots.map(timeSlot => timeSlot.clinicID)),
        )

        // Get list of clinics by clinicIDs
        return getClinics(clinicIDs)
    } catch (error) {
        console.error(`Error in getFilteredClinics: ${error}`)
    }
}

// Helper function to convert date format
export async function dateFormatConversion(timeSlots: TimeSlot[]) {
    return timeSlots.map(timeSlot => {
        return {
            ...timeSlot,
            timeSlotStart: convertTimeStamp(new Date(timeSlot.timeSlotStart)),
            timeSlotEnd: convertTimeStamp(new Date(timeSlot.timeSlotEnd)),
        }
    })
}

export function convertTimeStamp(date: Date) {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}`
}
