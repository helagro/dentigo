import { initAuth, collect } from '../src/bankId'

describe('BankID initAuth function', () => {
    it('should not be null', async () => {
        const randomBuffer = Buffer.from(new Uint8Array(32))
        const res = await initAuth(
            'random-client-id',
            '127.0.0.1',
            randomBuffer,
        )
        expect(res).not.toBeNull()
    })
})

describe('BankID collect function', () => {
    it('should not be null', async () => {
        const randomBuffer = Buffer.from(new Uint8Array(32))

        const res = await collect('random-client-id', '123', randomBuffer)
        expect(res).not.toBeNull()
    })
})
