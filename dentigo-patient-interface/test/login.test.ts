import { describe, it, expect } from 'vitest'
import { getIP } from '../src/modules/login'

describe('getIP', () => {
    it('should return a defined variable', async () => {
        const ip = await getIP()
        expect(ip).toBeDefined()
    })

    it('should return a string', async () => {
        const ip = await getIP()
        expect(typeof ip).toBe('string')
    })
})
