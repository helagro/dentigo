import { request } from '../mqtt'
import Clinic from '@/entities/Clinic'

export async function getClinicData(): Promise<Clinic[]> {
    const response: Uint8Array = (await request(
        'clinic/clinics/get/all',
        'clinic/clinics/get/all/response',
        {},
        2,
    )) as Uint8Array
    const responseObj = JSON.parse(response.toString())

    const clinics: Clinic[] = []

    for (const clinicData of responseObj) {
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
}
