import {
    downloadKey,
    encryptAES,
    decryptAES,
    encrypt,
    encode,
    decode,
} from '../src/services/encryptionService'
import * as crypto from 'crypto'

describe('downloadKey()', () => {
    const key: Promise<string | null> = downloadKey('bookingServiceEncrypt')

    it('should return a non-null key', async () => {
        expect(await key).not.toBeNull()
    })
})

describe('Encryption', () => {
    const text = 'test'

    const publicKey = downloadKey('bookingServiceEncrypt')

    it('should return a non-null encrypted string', async () => {
        const key = await publicKey
        if (key) {
            expect(encrypt(text, key)).not.toBeNull()
        }
    })
})

describe('AES encryption', () => {
    const text = 'Hello World!'

    const AESKey = crypto.generateKeySync('aes', { length: 256 })
    const AESkeyBuffer = AESKey.export()

    const encrypted = encryptAES(text, AESkeyBuffer)
    const [encryptedContent, iv] = encrypted.split(',')

    it('should return a non-null encrypted string', () => {
        expect(encryptedContent).not.toBeNull()
    })

    const decrypted = decryptAES(encryptedContent, AESkeyBuffer, iv)

    it('should return a non-null decrypted string', () => {
        expect(decrypted).not.toBeNull()
    })

    it('should match the original text', () => {
        expect(decrypted).toBe(text)
    })
})

describe('Encode and decode base64', () => {
    const text = 'Hello world!'
    const encoded = encode(text)

    it('should return a non-null encoded string', () => {
        expect(encoded).not.toBeNull()
    })

    const decoded = decode(encoded)

    it('should return a non-null decoded string', () => {
        expect(decoded).not.toBeNull()
    })

    it('should return the original text', () => {
        expect(decoded).toBe(text)
    })
})
