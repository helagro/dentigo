import { Notification } from '../entities/Notification'
import { ClinicNotificationSubscription } from '../entities/ClinicNotificationSubscription'
import { SubscriptionReq } from '../processors/SubscriptionReq'
import { OperationResponse } from '../OperationResponse'

/* ------------------------- Handle database related operations ------------------------ */

export async function saveNotificationToDB(
    userId: string,
    message: string,
    email: string,
) {
    const notification = Notification.create({
        userId: userId,
        message: message,
        email: email,
    })
    await notification.save()
    console.log('Database: Notification saved.')
    return notification
}

export async function saveSubscriptionPreferenceToDB(
    payload: SubscriptionReq,
): Promise<OperationResponse> {
    if (await subscriptionExists(payload))
        return new OperationResponse(409, 'Subscription already exists')

    if (emailIsInvalid(payload.email))
        return new OperationResponse(400, 'Invalid email')

    const clinicNotificationSubscription =
        ClinicNotificationSubscription.create({
            clinicId: payload.clinicID,
            userEmail: payload.email,
        })
    await clinicNotificationSubscription.save()

    return new OperationResponse(201, 'Subscription saved successfully')
}

async function subscriptionExists(payload: SubscriptionReq): Promise<boolean> {
    const existingSubscription = await ClinicNotificationSubscription.findOne({
        where: {
            clinicId: payload.clinicID,
            userEmail: payload.email,
        },
    })
    return !!existingSubscription
}

function emailIsInvalid(email: string): boolean {
    // imported from https://emailregex.com/, following the RFC 5322 standard
    const emailRegex =
        /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

    return !emailRegex.test(email)
}

export async function removeSubscriptionPreferenceFromDB(
    payload: SubscriptionReq,
): Promise<OperationResponse> {
    const query: {
        clinicId?: string
        userEmail: string
    } = {
        userEmail: payload.email,
    }

    if (payload.clinicID !== 'ALL_CLINICS') {
        query['clinicId'] = payload.clinicID
    }

    const deletedSubscription =
        await ClinicNotificationSubscription.delete(query)

    if (deletedSubscription.affected && deletedSubscription.affected > 0) {
        console.log('Database: Clinic Notification Subscription removed.')
        return new OperationResponse(
            200,
            'Clinic Notification Subscription removed successfully.',
        )
    } else {
        console.log('Database: Clinic Notification Subscription not found.')
        return new OperationResponse(
            404,
            'Clinic Notification Subscription not found.',
        )
    }
}

export async function getEmailByUserId(userId: string) {
    try {
        const userEmail = await Notification.findOne({
            where: {
                userId: userId,
            },
            select: { email: true },
        })
        return userEmail.email
    } catch (err) {
        console.error('Error retrieving email by userId: ', err)
    }
}

export async function getMessagesByUserId(userId: string) {
    try {
        const notifications = await Notification.find({
            where: {
                userId: userId,
                isRead: false,
            },
            order: {
                createdAt: 'DESC',
            },
            select: ['message', 'id'],
        })
        console.log(notifications)
        return notifications
    } catch (err) {
        console.error('Error retrieving messages by userId: ', err)
    }
}

export async function updateReadNotifications(
    userId: string,
    notificationId: string,
) {
    try {
        const notification = await Notification.findOne({
            where: {
                id: notificationId,
            },
        })
        if (notification && notification.userId === userId) {
            notification.isRead = true
            await notification.save()
            console.log(
                `Notification ${notificationId} marked as read successfully.`,
            )
            return notification
        } else {
            console.log('Notification update failed.')
        }
    } catch (err) {
        console.error(
            'Error updating notification isRead status by its id: ',
            err,
        )
    }
}

export async function checkClinicExists(clinicID: string) {
    const clinic = await ClinicNotificationSubscription.findOne({
        where: { clinicId: clinicID },
    })
    return !!clinic
}

export async function getAllSubscribersEmails(clinicID: string) {
    return ClinicNotificationSubscription.find({
        where: {
            clinicId: clinicID,
        },
        select: ['userEmail'],
    })
}
