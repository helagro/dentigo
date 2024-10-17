import { describe, it, expect } from 'vitest'
import { getID } from '../src/modules/mqtt'

describe('getID', () => {
    it('should return a defined variable', () => {
        const id = getID()
        expect(id).toBeDefined()
    })

    it('should return a string', () => {
        const id = getID()
        expect(typeof id).toBe('string')
    })
})
