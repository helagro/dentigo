declare type getByClinicMessage = {
    clientID: string
    clinicID: string
    signature: string
}

declare type getByDentistMessage = {
    clientID: string
    dentistID: string
    signature: string
}

export { getByClinicMessage, getByDentistMessage }
