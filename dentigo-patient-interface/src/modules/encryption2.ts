import { Buffer } from 'buffer'
import axios from 'axios'

/*
    This is the new encryption module. It uses a combination of RSA
    and AES to allow for fast secure transfer of large amounds of data
*/

/* ----------------------- ALGORITHMS ----------------------- */

const symetricAlgorithm = {
    name: 'AES-CTR',
    length: 256,
}

const encryptAlgorithm = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
}

/* ----------------------- GET KEYS ---------------------- */

const keyAES = crypto.subtle?.generateKey(symetricAlgorithm, true, [
    'encrypt',
    'decrypt',
]) as Promise<CryptoKey>

const bufAES: Promise<ArrayBuffer> = (async () =>
    crypto.subtle?.exportKey('raw', await keyAES))()

export async function downloadPublicKey(keyName: string): Promise<string> {
    const pemKey = await axios.get(`/data/${keyName}.pem`, {
        headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            Expires: '0',
        },
    })
    return stripPEM(pemKey.data)
}

/* ----------------------- ENCRYPT ----------------------- */

//** The keyStr is not in PEM format, the headers and whitespaces shall be stripped */
export async function encrypt(text: string, keyStr: string): Promise<string> {
    const keyBuf = Buffer.from(keyStr, 'base64')
    const key: CryptoKey = await crypto.subtle?.importKey(
        'spki',
        keyBuf,
        encryptAlgorithm,
        false,
        ['encrypt'],
    )

    const encryptedKey: string = await encryptRSA(await bufAES, key)
    const encryptionRes = await encryptAES(text)

    return encryptedKey + ',' + encryptionRes.content + ',' + encryptionRes.iv
}

export async function encryptAES(
    text: string,
): Promise<{ content: string; iv: string }> {
    const textBuf = Buffer.from(text, 'utf8')

    const iv = crypto.getRandomValues(new Uint8Array(16))

    const encrypted = await crypto.subtle?.encrypt(
        { name: 'AES-CTR', iv, counter: iv, length: 64 },
        await keyAES,
        textBuf,
    )

    return { content: bufToBase64(encrypted), iv: bufToBase64(iv) }
}

async function encryptRSA(
    content: ArrayBuffer,
    key: CryptoKey,
): Promise<string> {
    const encrypted = await crypto.subtle?.encrypt(
        { name: 'RSA-OAEP' },
        key,
        content,
    )
    return bufToBase64(encrypted)
}

/* ----------------------- DECRYPT ----------------------- */

export async function decrypt(input: string): Promise<string> {
    const [content, iv] = input.split(',')

    return decryptAES(content, iv)
}

export async function decryptAES(
    contentStr: string,
    ivStr: string,
): Promise<string> {
    const iv = Buffer.from(ivStr, 'base64')
    const content = Buffer.from(contentStr, 'base64')

    const decrypted = await crypto.subtle?.decrypt(
        { name: 'AES-CTR', iv, counter: iv, length: 64 },
        await keyAES,
        content,
    )

    return new TextDecoder().decode(decrypted)
}

/* ----------------------- HELPERS ----------------------- */

export function bufToBase64(buffer: ArrayBuffer): string {
    const binary = new Uint8Array(buffer)
    const array = Array.from(binary)
    const base64 = btoa(String.fromCharCode.apply(null, array))
    return base64
}

export function stripPEM(key: string): string {
    return key
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\n/g, '')
}
