export class MQTTError extends Error {
    code: number
    constructor({ message, code }: { message: string; code: number }) {
        super(message)
        this.name = 'MQTTError'
        this.code = code
    }
}
