import {
    hash,
    sign,
    verify,
    downloadKey,
    encryptRSA,
    bufToBase64,
    decryptRSA,
    encryptAES,
    decryptAES,
    loadKey,
    encode,
    decode,
} from '../src/encryption'
import * as crypto from 'crypto'

describe('Sign and verify functionality', () => {
    const text = 'Hello world'
    const hashed = hash(text)
    const signature = sign(hashed)
    let publicKey: string | null = null

    console.log('hashed: ', hashed)

    beforeAll(async () => {
        publicKey = await downloadKey('userServiceSign')
    })

    it('should return a non-null hash', async () => {
        expect(hashed).not.toBeNull()
    })

    it('should return a non-null signature', async () => {
        expect(signature).not.toBeNull()
    })

    it('should download a non-null public key', async () => {
        expect(publicKey).not.toBeNull()
    })

    it('should verify the signature', async () => {
        if (!publicKey) throw new Error('publicKey is null')

        const verified = verify(hashed, signature, publicKey)
        expect(verified).toBe(true)
    })
})

describe('Encrypt and decrypt RSA', () => {
    const text = 'Hello world'
    const publicKey = downloadKey('userServiceEncrypt') as Promise<string>

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

describe('Encrypt and decrypt AES', () => {
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

describe('hash()', () => {
    const text = 'Hello world!'
    const hashed = hash(text)

    it('should return a non-null hash', async () => {
        expect(hashed).not.toBeNull()
    })

    it('should return a hash with length 44', async () => {
        expect(hashed.length).toBe(44)
    })
})

describe('loadKey()', () => {
    const key: string = loadKey('privateSign')

    it('should return a non-null key', async () => {
        expect(key).not.toBeNull()
    })
})

describe('downloadKey()', () => {
    const key: Promise<string | null> = downloadKey('userServiceEncrypt')

    it('should return a non-null key', async () => {
        expect(await key).not.toBeNull()
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
