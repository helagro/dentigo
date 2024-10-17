import {
    checkClinicExists,
    getAllSubscribersEmails,
    removeSubscriptionPreferenceFromDB,
    saveNotificationToDB,
    saveSubscriptionPreferenceToDB,
    getEmailByUserId,
} from '../database/operations'
import { SubscriptionReq } from './SubscriptionReq'
import { publishMessage } from '../mqttService'
import { OperationResponse } from '../OperationResponse'

/* ------------------------- Extract payload contents and convert to notification-related ------------------------ */

export async function processNewBookingNotifier(
    mqttMessage: string,
    userID: string,
) {
    try {
        const mqttMsg = JSON.parse(mqttMessage)
        const message = await createMessage({
            messageType: 'newBooking',
            timeslot: mqttMsg.timeslot,
        })
        const newNotification = await saveNotificationToDB(
            userID,
            message.toString(),
            mqttMsg.email,
        )
        return newNotification
    } catch (err) {
        console.error('Error parsing JSON: ', err)
    }
}

export async function processCancelledBookingNotifier(
    mqttMessage: string,
    userID: string,
) {
    try {
        const mqttMsg = JSON.parse(mqttMessage)
        const message = await createMessage({
            messageType: 'cancelledBooking',
            timeslot: mqttMsg.timeslot,
        })
        let email
        // Two cases of cancellation:
        // Case 1: Cancelled by the dentist - No patient email information available in the payload
        if (!mqttMsg.email) {
            // call db method to get patient email
            email = await getEmailByUserId(userID)
        }
        // Case 2: Cancelled by the patient - patient email is included in the payload
        else {
            email = mqttMsg.email
        }
        const newNotification = await saveNotificationToDB(
            userID,
            message.toString(),
            email,
        )
        return newNotification
    } catch (err) {
        console.error('Error parsing JSON: ', err)
    }
}

export async function processReleaseNewTimeslotNotifier(
    mqttMessage: string,
    sharedContext: { newTimeslot: string; clinicID: string },
) {
    try {
        const payload = JSON.parse(mqttMessage)

        // Check if the clinicID exists in the db
        // if it does, that means there are patients subscribed to the clinic
        const clinicExists = await checkClinicExists(payload.clinicID)
        if (clinicExists) {
            if (payload.dentistName) {
                return await processReturnedNames(payload, sharedContext)
            } else {
                return await prepareRequestingNamesMessage(payload)
            }
        } else {
            console.log('No patients subscribed to this clinic.')
            return null
        }
    } catch (err) {
        console.error('Error parsing JSON: ', err)
    }
}

export async function processSubscribeNewSlotNotifier(
    mqttMessage: string,
    subscribeStatus: string,
) {
    let payload: SubscriptionReq | null = null
    let response: OperationResponse | null = null
    try {
        payload = JSON.parse(mqttMessage)

        if (subscribeStatus === 'subscribe') {
            response = await saveSubscriptionPreferenceToDB(payload)
        } else {
            response = await removeSubscriptionPreferenceFromDB(payload)
        }

        publishMessage(
            response?.toJSON(),
            `clients/${payload.clientID}/${subscribeStatus}NewTimeslot`,
        )
    } catch (err) {
        if (err instanceof SyntaxError || !payload) {
            console.error(
                'JSON Error during process clinicNotificationSubscription:',
                err,
            )
        } else {
            console.error(
                'Error during process clinicNotificationSubscription: ',
                err,
            )
            publishMessage(
                new OperationResponse(
                    500,
                    'Error during process clinicNotificationSubscription',
                ).toJSON(),
                `clients/${payload.clientID}/${subscribeStatus}NewTimeslot`,
            )
        }
    }
}

/* ------------------------- Helpers ------------------------ */

type MessageParams = {
    messageType: 'newBooking' | 'cancelledBooking' | 'newTimeslot'
    timeslot: string
    dentistName?: string
    clinicName?: string
    clinicID?: string
}

export function createMessage(params: MessageParams) {
    switch (params.messageType) {
        case 'newBooking':
            return `Your booking for ${params.timeslot} has been successful.`
        case 'cancelledBooking':
            return `Your booking for ${params.timeslot} has been cancelled.`
        case 'newTimeslot':
            // "$EMAIL_ADDRESS" will be replaced with the email address of the recipient before sending
            return `
<p>Hello!</p>

<p>
Clinic ${params.clinicName}: Dentist ${params.dentistName} has a new appointment slot ${params.timeslot}.
</p>

<p>Reservations are welcome!</p>

<p>
    <a href="https://dentigo-patient-interface.vercel.app/unsubscribe?email=$EMAIL_ADDRESS&clinic=${params.clinicID}">Unsubsribe</a> 
    from notifications about this clinic
</p>
<p><a href="https://dentigo-patient-interface.vercel.app/unsubscribe?email=$EMAIL_ADDRESS&clinic=ALL_CLINICS">Unsubsribe</a> 
    from notifications about all clinics
</p>
`
        default:
            throw Error(`Invalid message type: "${params.messageType}"`)
    }
}

export async function processReturnedNames(
    payload: { dentistName: string; clinicName: string },
    sharedContext: { newTimeslot: string; clinicID: string },
) {
    const message = await createMessage({
        messageType: 'newTimeslot',
        timeslot: sharedContext.newTimeslot,
        dentistName: payload.dentistName,
        clinicName: payload.clinicName,
        clinicID: sharedContext.clinicID,
    })

    const emailAddressList = await getAllSubscribersEmails(
        sharedContext.clinicID,
    )

    return {
        message,
        emails: emailAddressList.map(entry => entry.userEmail),
    }
}

export async function prepareRequestingNamesMessage(payload: {
    clinicID: string
    dentistID: string
}) {
    const requestMessage = {
        dentistID: payload.dentistID,
        clinicID: payload.clinicID,
    }
    return JSON.stringify(requestMessage)
}
