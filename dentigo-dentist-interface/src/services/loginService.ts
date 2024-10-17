import { authResult, credentials, userStore } from '../types/types.js'
import { downloadKey, encrypt, decrypt, verify } from './encryptionService.js'
import * as mqttService from '../services/mqttService.js'
import { getResponse } from '../requestManager.js'

export const store: userStore = {
    clientID: null,
    email: null,
    dentistID: null,
    clinicID: null,
    signature: null,
}

export async function authDentist(cred: credentials): Promise<authResult> {
    const message = {
        clientID: store.clientID,
        email: cred.email,
        password: cred.password,
    }
    const publicKey = await downloadKey('clinicServiceEncrypt')
    const encrypted = encrypt(JSON.stringify(message), publicKey)
    mqttService.publish('clinic/dentists/auth', encrypted)

    const mqttRes = await getResponse()
    const { email, dentistID, clinicID, signature, error } = JSON.parse(
        decrypt(mqttRes),
    )

    if (error) {
        return {
            isSuccessful: false,
            error: error,
            email: null,
            dentistID: null,
            clinicID: null,
            signature: null,
        }
    }

    const signKey = await downloadKey('clinicServiceSign')
    return {
        isSuccessful: verify(dentistID, signature, signKey),
        error: error,
        email: email,
        dentistID: dentistID,
        clinicID: clinicID,
        signature: signature,
    }
}
