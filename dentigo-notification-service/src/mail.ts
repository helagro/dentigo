import * as nodemailer from 'nodemailer'
import 'dotenv/config'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ACC_EMAIL,
        pass: process.env.ACC_PASS,
    },
})

const mailOptions = {
    from: process.env.ACC_EMAIL,
}

export function getEmailSubject(pubTopicEndpoint: string): string {
    if (pubTopicEndpoint.includes('newBooking')) {
        return 'DENTIGO - Your Dentist Appointment is Confirmed'
    } else if (pubTopicEndpoint.includes('cancelledBooking')) {
        return 'DENTIGO - Your Dentist Appointment is Cancelled'
    } else if (pubTopicEndpoint.includes('releaseNewTimeslot')) {
        return 'DENTIGO - New Available Time Slot'
    }
    return 'DENTIGO - Notification'
}

export function sendToEmailList(
    message: string,
    subject: string,
    emailAddressList: string[],
) {
    for (const emailAddress of emailAddressList) {
        const urlEncodedEmail = encodeURIComponent(emailAddress)
        const processedMsg = message.replace(
            /\$EMAIL_ADDRESS/g,
            urlEncodedEmail,
        )
        sendEmail(processedMsg, subject, emailAddress)
    }
}

export const sendEmail = (html: string, subject: string, email: string) => {
    transporter.sendMail(
        { ...mailOptions, html, subject, to: email },
        (error, info) => {
            if (error) console.error('Error sending email:', error)
            else {
                console.log('Email sent:', info.messageId)
            }
        },
    )
}
