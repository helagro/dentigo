import {
    processNewBookingNotifier,
    processCancelledBookingNotifier,
    processReleaseNewTimeslotNotifier,
    processSubscribeNewSlotNotifier,
} from './notificationProcessor'
import {
    publishMessage,
    MQTT_SUB_TOPIC_BOOKING,
    MQTT_SUB_TOPIC_PATIENTUI,
    MQTT_SUB_TOPIC_CLINIC,
    MQTT_PUB_TOPIC,
} from '../mqttService'
import { sendEmail, getEmailSubject, sendToEmailList } from '../mail'
import { decrypt, encryptAES } from '../encryption'
import { Notification } from '../entities/Notification'
import {
    getMessagesByUserId,
    updateReadNotifications,
} from '../database/operations'

/* ------------------------ VARIABLES ----------------------- */

const sharedContext = { newTimeslot: '', clinicID: '' }
type TopicHandlers = {
    [key: string]: (mqttMessage: string) => Promise<void>
}

/* ------------------------- Distinguish between encrypted/non-encrypted mqttMessage on receive ------------------------ */

/** This method is to categorize received mqtt messages into two types, encrypted and unencrypted, based on whether the payload is json or not. */
export async function processMqttMessage({
    topic,
    mqttMessage,
}: {
    topic: string
    mqttMessage: string
}) {
    try {
        let mqttMsgJson = null
        try {
            mqttMsgJson = JSON.parse(mqttMessage)
        } catch (err) {
            console.error('Invalid json')
        }
        if (mqttMsgJson) {
            processNonEncryptedMqttMessage(topic, mqttMessage)
        } else {
            processEncryptedMqttMessage(topic, mqttMessage)
        }
    } catch (err) {
        console.log('Error occured while processing MQTT message: ', err)
    }
}

/** This method is to distribute all unencrypted mqtt messages according to the topic to be processed. */
async function processNonEncryptedMqttMessage(
    subTopic: string,
    mqttMessage: string,
) {
    console.log('Processing non-encrypted mqtt message', subTopic, mqttMessage)
    const topicHandlers: TopicHandlers = {
        [`${MQTT_SUB_TOPIC_BOOKING}/createBooking`]: processCreateBooking,
        [`${MQTT_SUB_TOPIC_BOOKING}/cancelBooking`]: processCancelBooking,
        [`${MQTT_SUB_TOPIC_BOOKING}/releaseNewTimeslot`]:
            processReleaseNewTimeslot,
        [`${MQTT_SUB_TOPIC_CLINIC}/getRequestedNames`]:
            processGetRequestedNames,
        [`${MQTT_SUB_TOPIC_PATIENTUI}/subscribeNewTimeslot`]:
            processSubscribeNewTimeslot,
        [`${MQTT_SUB_TOPIC_PATIENTUI}/unsubscribeNewTimeslot`]:
            processUnsubscribeNewTimeslot,
    }

    const handler = topicHandlers[subTopic as string]
    if (handler) {
        await handler(mqttMessage)
    }
}

/** This method is to distribute all encrypted mqtt messages according to the topic to be processed. */
async function processEncryptedMqttMessage(
    subTopic: string,
    mqttMessage: string,
) {
    try {
        const payload = JSON.parse(decrypt(mqttMessage.toString()).content)
        if (payload.userID) {
            switch (subTopic) {
                case `${MQTT_SUB_TOPIC_PATIENTUI}/retrieveAllNotifications`: {
                    await processRetrieveAllNotifications(mqttMessage)
                    break
                }
                case `${MQTT_SUB_TOPIC_PATIENTUI}/updateReadNotifications`: {
                    processUpdateReadNotifications(
                        JSON.stringify(payload),
                        mqttMessage,
                    )
                    break
                }
            }
        }
    } catch (err) {
        console.error('Error occured during processing encrytion message', err)
    }
}

/* ------------------------- Handle mqttMessage more specifically ------------------------ */

async function processCreateBooking(mqttMessage: string) {
    const notification = await processNewBookingNotifier(
        mqttMessage,
        JSON.parse(mqttMessage).userID,
    )
    await sendNonEncryptedUserNotifications('newBooking', notification)
}

async function processCancelBooking(mqttMessage: string) {
    const notification = await processCancelledBookingNotifier(
        mqttMessage,
        JSON.parse(mqttMessage).userID,
    )
    await sendNonEncryptedUserNotifications('cancelledBooking', notification)
}

async function processReleaseNewTimeslot(mqttMessage: string) {
    sharedContext.newTimeslot = JSON.parse(mqttMessage).timeslot
    sharedContext.clinicID = JSON.parse(mqttMessage).clinicID

    const requestPayload = await processReleaseNewTimeslotNotifier(
        mqttMessage,
        sharedContext,
    )
    if (requestPayload) {
        console.log('asking for dentist name now', requestPayload)
        publishMessage(
            requestPayload.toString(),
            'clinic/notifications/requestNames',
        )
    }
}

async function processGetRequestedNames(mqttMessage: string) {
    type NotificationInfo = {
        message: string
        emails: string[]
    }

    const notificationInfo: NotificationInfo =
        (await processReleaseNewTimeslotNotifier(
            mqttMessage,
            sharedContext,
        )) as NotificationInfo

    const emailArray = notificationInfo.emails

    const notificationMsg = notificationInfo.message
    await sendNonEncryptedUserNotifications('releaseNewTimeslot', {
        message: notificationMsg,
        emailList: emailArray,
    })
}

async function processSubscribeNewTimeslot(mqttMessage: string) {
    await processSubscribeNewSlotNotifier(mqttMessage, 'subscribe')
}

async function processUnsubscribeNewTimeslot(mqttMessage: string) {
    await processSubscribeNewSlotNotifier(mqttMessage, 'unsubscribe')
}

async function processRetrieveAllNotifications(mqttMessage: string) {
    await sendEncrytedUserNotifications('notifications', mqttMessage)
}

async function processUpdateReadNotifications(
    payload: string,
    mqttMessage: string,
) {
    const notification = await updateReadNotifications(
        JSON.parse(payload).userID,
        JSON.parse(payload).notificationID,
    )
    if (notification) {
        sendEncrytedUserNotifications('updatedNotifications', mqttMessage)
    }
}

/* ------------------------- Publish mqttMessage & Send emails ------------------------ */

async function sendEncrytedUserNotifications(
    pubTopicEndpoint: string,
    mqttMessage: string,
) {
    const decryptedMsg = decrypt(mqttMessage)
    const payload = JSON.parse(decryptedMsg.content)
    const notifications = await getMessagesByUserId(payload.userID)
    const returnPayload = encryptAES(
        JSON.stringify(notifications),
        decryptedMsg.keyAES,
    )
    publishEncyptedPayload(
        returnPayload,
        `clients/${payload.clientID}/response/` + pubTopicEndpoint,
    )
}

async function sendNonEncryptedUserNotifications(
    pubTopicEndpoint: string,
    notification: Notification | { message: string; emailList: string[] },
) {
    try {
        const emailSubject = getEmailSubject(pubTopicEndpoint)

        if (notification instanceof Notification) {
            sendEmail(notification.message, emailSubject, notification.email)
            publishNonencryptedPayload(
                JSON.stringify(notification),
                pubTopicEndpoint,
            )
        } else {
            sendToEmailList(
                notification.message,
                emailSubject,
                notification.emailList,
            )
        }
    } catch (err) {
        console.error('Error during sending messages: ', err)
    }
}

/* -------------------------- MQTT -------------------------- */

function publishNonencryptedPayload(
    notification: string,
    pubTopicEndpoint: string,
) {
    const returnPayload = {
        id: JSON.parse(notification).id,
        message: JSON.parse(notification).message,
    }
    publishMessage(
        JSON.stringify(returnPayload),
        MQTT_PUB_TOPIC + '/' + pubTopicEndpoint,
    )
}

function publishEncyptedPayload(payload: string, pubTopic: string) {
    publishMessage(payload, pubTopic)
}
