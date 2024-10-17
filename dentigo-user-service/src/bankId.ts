import { BankIdClientV6, QrGenerator } from 'bankid'
import { publish } from './mqttClient'
import { hash, sign } from './encryption'

const COLLECT_DELAY = 2000

const client = new BankIdClientV6({
    production: false,
})

let numberOfClientsAuthenticating = 0

/* ------------------------- PUBLIC ------------------------- */

export async function initAuth(clientID: string, ip: string, key: Buffer) {
    numberOfClientsAuthenticating++

    try {
        const res = await client.authenticate({
            endUserIp: ip,
        })

        const autoStartToken = res.autoStartToken
        const orderRef = res.orderRef
        const qr = await getQR(res.qr, orderRef)

        setTimeout(() => collect(clientID, orderRef, key), 500)

        return {
            autoStartToken,
            orderRef,
            qr,
            status: 'pending',
        }
    } catch (err) {
        numberOfClientsAuthenticating--

        console.error('Error in initAuth: ', err)
        return { status: 'failed' }
    }
}

export async function collect(
    clientID: string,
    orderRef: string,
    key: Buffer,
): Promise<void> {
    try {
        const res = await client.collect({ orderRef })
        const status = res.status

        switch (res.status) {
            case 'pending': {
                const qr = await getCashedQR(orderRef)

                setTimeout(
                    () => collect(clientID, orderRef, key),
                    COLLECT_DELAY,
                )
                publish(`clients/${clientID}/auth/update`, { qr, status }, key)
                return
            }
            case 'failed':
                publish(`clients/${clientID}/auth/update`, { status }, key)
                break
            case 'complete': {
                const userID = hash(res.completionData?.user.personalNumber)
                const signature = sign(userID)

                const userFrom = res.completionData?.user
                const user = {
                    fName: userFrom?.givenName,
                    lName: userFrom?.surname,
                    socials: userFrom?.personalNumber,
                    id: userID,
                    signature,
                }

                publish(
                    `clients/${clientID}/auth/update`,
                    {
                        status,
                        user,
                    },
                    key,
                )
            }
        }
    } catch (err) {
        publish(`clients/${clientID}/auth/update`, { status: 'error' }, key)
    }

    numberOfClientsAuthenticating--
}

export function getNumberOfClientsAuthenticating() {
    return numberOfClientsAuthenticating
}

/* ------------------------- PRIVATE ------------------------ */

async function getQR(qr: QrGenerator | undefined, orderRef: string) {
    const generator = qr?.nextQr(orderRef, { timeout: 60 })
    const qrMeme = await generator?.next()

    return qrMeme?.value
}

function getCashedQR(orderRef: string) {
    return QrGenerator.latestQrFromCache(orderRef)
}
