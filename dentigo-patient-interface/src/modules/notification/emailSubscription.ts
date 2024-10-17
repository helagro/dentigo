import type Clinic from '@/entities/Clinic'
import { requestJSON } from '../mqtt'
import { ResponseMQTT } from '../mqtt'

export async function subscribeEmail(
    email: string,
    clinic: Clinic,
): Promise<ResponseMQTT> {
    const payload = { email, clinicID: clinic.id }

    try {
        const result = await requestJSON(
            'patientUI/subscribeNewTimeslot',
            'clients/$ID/subscribeNewTimeslot',
            payload,
            2,
        )

        return new ResponseMQTT(result.statusCode, result.message)
    } catch (e) {
        return new ResponseMQTT(-1, 'Failed to subscribe email')
    }
}

export async function unsubscribeEmail(
    email: string,
    clinicID: string,
): Promise<ResponseMQTT> {
    const payload = { email, clinicID }

    try {
        const result = await requestJSON(
            'patientUI/unsubscribeNewTimeslot',
            'clients/$ID/unsubscribeNewTimeslot',
            payload,
            2,
        )

        return new ResponseMQTT(result.statusCode, result.message)
    } catch (e) {
        return new ResponseMQTT(-1, 'Failed to unsubscribe email')
    }
}
