import User from './User'

export default class Update {
    status: string
    qr: string | null
    errorMsg: string | null
    user: User | null

    constructor(
        status: string,
        qr: string | null,
        errorMsg: string | null,
        user: User | null,
    ) {
        this.status = status
        this.qr = qr
        this.errorMsg = errorMsg
        this.user = user
    }
}
