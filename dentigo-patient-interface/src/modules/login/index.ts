import axios from 'axios'
import Update from './Update'
import { listen, unListen, request, getID } from '../mqtt'
import { decrypt, encrypt, downloadPublicKey } from '../encryption2'
import User from './User'

/* ------------------------ PUBLIC METHODS ------------------------ */

/** @throws {Error} */
async function initAuth() {
    const ip: string = await getIP()

    const data = { ip, clientID: getID() }
    const payload = JSON.stringify(data)

    const servicePublicKey = await downloadPublicKey('userServiceEncrypt')
    const encrypted = await encrypt(payload, servicePublicKey)

    const response = (await request(
        'users/auth/init',
        'clients/$ID/auth/init',
        encrypted,
        2,
    ).catch(() => {
        throw new Error('Failed to reach server')
    })) as Uint8Array
    const responseStr = response.toString()

    try {
        const result = await decrypt(responseStr)
        return JSON.parse(result)
    } catch (e) {
        console.error('Encryption error:', e)
        throw new Error('Encryption error')
    }
}

async function collectUpdates(cb: (update: Update | null) => void) {
    listen(`clients/$ID/auth/update`, 2, undefined, async (topic, message) => {
        const payload = await decrypt(message.toString())
        const data = JSON.parse(payload)

        let user: User | null = null
        if (data.status === 'complete') {
            user = new User(
                data.user.socials,
                data.user.fName,
                data.user.lName,
                data.user.id,
                data.user.signature,
            )
        }

        const update = new Update(data.status, data.qr, data.errorMsg, user)
        cb(update)

        if (update?.status !== 'pending') unListen(topic)
    })
}

export default { initAuth, collectUpdates }

/* ------------------------- HELPERS ------------------------ */

export const getIP = async (): Promise<string> =>
    (await axios.get('https://api.ipify.org/')).data
