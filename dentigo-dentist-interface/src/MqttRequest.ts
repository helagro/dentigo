/*
 * Inspired by the now archived API Gateway
 * https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-10/dentigo-api-gateway
 */

export default class MqttRequest {
    private reject: (reason: string) => void
    _resolve: (value: string) => void

    timeoutID: NodeJS.Timeout

    promise = new Promise<string>((resolve, reject) => {
        this._resolve = resolve
        this.reject = reject
    })

    constructor() {}

    public timeOut() {
        this.reject('\nYour request timed out, please try again later!')
    }

    public resolve(response: string) {
        if (this.timeoutID) clearTimeout(this.timeoutID)

        this._resolve(response)
    }
}
