import { describe, it, expect } from 'vitest'
import { encryptAES, decryptAES } from '../src/modules/encryption2'

describe('AES encryption', () => {
    it('should encrypt and decrypt a string', async () => {
        const encrypted = await encryptAES('test')

        const decrypted = await decryptAES(encrypted.content, encrypted.iv)
        expect(decrypted).toBe('test')
    })
})
