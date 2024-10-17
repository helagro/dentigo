import { type TimeSlot } from './TimeSlot'

export interface Dentist {
    id: string
    email: string
    firstName: string
    lastName: string
    image: string
    description: string
    clinicID: string
    timeSlots: TimeSlot[]
}
