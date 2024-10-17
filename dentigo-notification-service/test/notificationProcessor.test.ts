import {
    createMessage,
    prepareRequestingNamesMessage,
} from '../src/processors/notificationProcessor'

describe('Notification Processors', () => {
    describe('createMessage', () => {
        it('should generate a new booking notification message', async () => {
            const messageType = 'newBooking'
            const timeslot = '2023-10-06 10:00:00'
            const expectedMessage = `Your booking for 2023-10-06 10:00:00 has been successful.`

            const actualMessage = await createMessage({ messageType, timeslot })
            console.log(actualMessage)
            expect(actualMessage).toEqual(expectedMessage)
        })
        it('should generate a cancelled booking notification message', async () => {
            const messageType = 'cancelledBooking'
            const timeslot = '2023-10-06 10:00:00'
            const expectedMessage = `Your booking for 2023-10-06 10:00:00 has been cancelled.`

            const actualMessage = await createMessage({ messageType, timeslot })
            expect(actualMessage).toEqual(expectedMessage)
        })
        it('should generate a new timeslot notification message', async () => {
            const messageType = 'newTimeslot'
            const timeslot = '2023-10-06 10:00:00'
            const dentistName = 'Dr. Smith'
            const clinicName = 'ABC Dental Clinic'
            const expectedMessage = `
<p>Hello!</p>

<p>
Clinic ABC Dental Clinic: Dentist Dr. Smith has a new appointment slot 2023-10-06 10:00:00.
</p>

<p>Reservations are welcome!</p>

<p>
    <a href="https://dentigo-patient-interface.vercel.app/unsubscribe?email=$EMAIL_ADDRESS&clinic=undefined">Unsubsribe</a> 
    from notifications about this clinic
</p>
<p><a href="https://dentigo-patient-interface.vercel.app/unsubscribe?email=$EMAIL_ADDRESS&clinic=ALL_CLINICS">Unsubsribe</a> 
    from notifications about all clinics
</p>
`
            const actualMessage = await createMessage({
                messageType,
                timeslot,
                dentistName,
                clinicName,
            })
            expect(actualMessage).toEqual(expectedMessage)
        })
    })
})
describe('prepareRequestingNamesMessage', () => {
    it('should generate a request message for dentist name and clinic name', async () => {
        const payload = { clinicID: 'clinic3212', dentistID: 'dentist23070732' }

        const expectedMessage = JSON.stringify({
            dentistID: payload.dentistID,
            clinicID: payload.clinicID,
        })
        const actualMessage = await prepareRequestingNamesMessage(payload)
        expect(actualMessage).toEqual(expectedMessage)
    })
})
