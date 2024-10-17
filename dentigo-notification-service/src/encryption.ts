import * as crypto from 'crypto'
import { readFileSync } from 'fs'
import { join } from 'path'
import axios from 'axios'

const privateEncryptKey = loadKey('pickle')

/* ----------------------- ENCRYPTION ----------------------- */

//** Takes a publicKey in PEM format */
export function encryptRSA(text: string, publicKey: string): Buffer {
    const key = parseKey(publicKey)

    return crypto.publicEncrypt(
        {
            key,
            oaepHash: 'sha256',
        },
        Buffer.from(text, 'utf-8'),
    )
}

//** This method shall be used to send a response to the client */
export function encryptAES(text: string, key: Buffer): string {
    const iv: Buffer = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv('aes-256-ctr', key, iv)
    const encrypted: Buffer = Buffer.concat([
        cipher.update(text),
        cipher.final(),
    ])

    return [bufToBase64(encrypted), bufToBase64(iv)].join(',')
}

export function decrypt(input: string): { content: string; keyAES: Buffer } {
    const [encryptedKey, encryptedContent, iv] = input.split(',')

    const key: Buffer = decryptRSA(encryptedKey)
    return { content: decryptAES(encryptedContent, key, iv), keyAES: key }
}

export function decryptRSA(content: string): Buffer {
    return crypto.privateDecrypt(
        {
            key: privateEncryptKey,
            oaepHash: 'sha256',
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        Buffer.from(content, 'base64'),
    )
}

export function decryptAES(content: string, key: Buffer, iv: string): string {
    const contentBuf = Buffer.from(content, 'base64')
    const ivBuf = Buffer.from(iv, 'base64')

    const decipher = crypto.createDecipheriv('aes-256-ctr', key, ivBuf)
    const decrypted: Buffer = Buffer.concat([
        decipher.update(contentBuf),
        decipher.final(),
    ])

    return decrypted.toString('utf-8')
}

/* ------------------------- SIGNING ------------------------ */

export function verify(
    text: string,
    signature: string,
    publicKey: string,
): boolean {
    const verify = crypto.createVerify('RSA-SHA256')
    verify.update(text)
    return verify.verify(publicKey, signature, 'base64')
}

/* ------------------------- HASHING ------------------------ */

export function hash(text: string): string {
    const hash = crypto.createHash('sha256')
    hash.update(text)
    return hash.digest('base64')
}

/* ------------------------- GET KEY ------------------------ */

export function loadKey(keyName: string) {
    const privateKeyPath = join(__dirname, `../config/${keyName}.pem`)
    const privateKeyStr = readFileSync(privateKeyPath, 'utf-8')
    return parseKey(privateKeyStr)
}

export async function downloadKey(keyName: string): Promise<string | null> {
    const host =
        process.env.KEY_HOST || 'https://dentigo-patient-interface.vercel.app'
    const address = `${host}/data/${keyName}.pem`

    try {
        const res = await axios.get(address)
        return res.data
    } catch (err) {
        throw new Error(`Could not download key from ${address}`)
    }
}

/* ------------------------- HELPERS  ------------------------ */

function parseKey(key: string): string {
    return decode(convertKeyToBase64(key))
}

function decode(str: string): string {
    return Buffer.from(str, 'base64').toString('utf-8')
}

function encode(str: string): string {
    return Buffer.from(str, 'utf-8').toString('base64')
}

// inspired by the encrypt-rsa library
function convertKeyToBase64(key: string) {
    return encode(key.replace(/^ +/gm, ''))
}

// Inspired by ChatGPT
export function bufToBase64(buffer: Buffer): string {
    return buffer.toString('base64')
}
