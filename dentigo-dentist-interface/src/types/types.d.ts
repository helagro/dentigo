declare type credentials = {
    email: string
    password: string
}

declare type authResult = {
    isSuccessful: boolean
    error: string
    email: string
    dentistID: string
    clinicID: string
    signature: string
}

declare type userStore = {
    clientID: string
    email: string
    dentistID: string
    clinicID: string
    signature: string
}

declare type TimeSlot = {
    id: string
    timeSlotStart: string
    timeSlotEnd: string
    clinicID: string
    dentistID: string
    patientID: string
}

export { credentials, authResult, userStore, TimeSlot }
