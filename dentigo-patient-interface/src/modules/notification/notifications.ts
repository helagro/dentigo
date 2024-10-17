import { request, getID, subscribe, listen } from '../mqtt'
import { useUserStore } from '@/store'
import { decrypt, encrypt, downloadPublicKey } from '../encryption2'
import { emit } from '@/eventBus'

const newBookingTopic = 'notifications/newBooking'
const cancelledBookingTopic = 'notifications/cancelledBooking'

export async function getNotificationData() {
    const pubTopic = 'patientUI/retrieveAllNotifications'
    const subTopicEndpoint = 'notifications'
    return await requestNotifications('', pubTopic, subTopicEndpoint)
}

export async function updateUnreadNotificationList(notificationID: string) {
    const pubTopic = 'patientUI/updateReadNotifications'
    const subTopicEndpoint = 'updatedNotifications'
    return await requestNotifications(
        notificationID,
        pubTopic,
        subTopicEndpoint,
    )
}

async function requestNotifications(
    notificationID: string,
    pubTopic: string,
    subTopicEndpoint: string,
) {
    const userStore = useUserStore()
    const userID = userStore.user?.id
    const signature = userStore.user?.signature

    let data
    if (notificationID.length === 0) {
        data = { userID, clientID: getID(), signature }
    } else {
        data = { userID, clientID: getID(), signature, notificationID }
    }
    const publicKey = await downloadPublicKey('notificationServiceEncrypt')
    const encrypted = await encrypt(JSON.stringify(data), publicKey)

    const response = (await request(
        pubTopic,
        'clients/$ID/response/' + subTopicEndpoint,
        encrypted,
        2,
    )) as Uint8Array

    const payloadResponse = await decrypt(response.toString())
    const payloadRes = JSON.parse(payloadResponse)
    return payloadRes
}

export async function subscribeToBookingNotifications() {
    subscribe(
        [newBookingTopic, cancelledBookingTopic],
        1,
        undefined,
        (error, granted) => {
            if (error) {
                console.error(
                    'Error subscribing to booking notifications:',
                    error,
                )
            } else {
                console.log('Subscribe to booking notifications:', granted)
            }
        },
    )
    listenForNewBookingNotifications()
    listenForCancelledBookingNotifications()
}
async function listenForNewBookingNotifications() {
    listen(newBookingTopic, 1, undefined, (topic, message) => {
        handleBookingNotification(JSON.parse(message.toString()))
    })
}
async function listenForCancelledBookingNotifications() {
    listen(cancelledBookingTopic, 1, undefined, (topic, message) => {
        handleBookingNotification(JSON.parse(message.toString()))
    })
}

function handleBookingNotification(bookingData: {
    id: string
    message: string
}) {
    console.log('New booking data received', bookingData)
    emit('newNotification', bookingData)
}
