import {
    bufToBase64,
    decryptAES,
    decryptRSA,
    downloadKey,
    encryptAES,
    encryptRSA,
    loadKey,
} from '../src/encryption'
import * as crypto from 'crypto'

describe('RSA encryption and decryption', () => {
    const text = 'Hello world'
    const publicKey = downloadKey(
        'notificationServiceEncrypt',
    ) as Promise<string>

    it('should download a non-null public key', async () => {
        expect(await publicKey).not.toBeNull()
    })

    const encrypted = (async () => encryptRSA(text, await publicKey))()

    it('should return a non-null encrypted string', async () => {
        expect(encrypted).not.toBeNull()
    })

    const decrypted: Promise<string> = (async () => {
        const encryptedBase64 = bufToBase64(await encrypted)
        const decryptedBuffer = decryptRSA(encryptedBase64)
        return decryptedBuffer.toString('utf8')
    })()

    it('should return a non-null decrypted string', async () => {
        expect(await decrypted).not.toBeNull()
    })

    it('should return the original text', async () => {
        expect(await decrypted).toBe(text)
    })
})

describe('AES encryption and decryption', () => {
    const text = 'Hello world'
    const key = crypto.generateKeySync('aes', { length: 256 })
    const keyBuffer = key.export()
    const encrypted = encryptAES(text, keyBuffer)
    const [content, iv] = encrypted.split(',')

    it('should return a non-null encrypted string', async () => {
        expect(content).not.toBeNull()
    })

    const decrypted = decryptAES(encrypted, keyBuffer, iv)

    it('should return a non-null decrypted string', async () => {
        expect(decrypted).not.toBeNull()
    })

    it('should return the original text', async () => {
        expect(decrypted).toBe(text)
    })
})

describe('loadKey()', () => {
    const key: string = loadKey('pickle')

    it('should return a non-null key', async () => {
        expect(key).not.toBeNull
    })
})
