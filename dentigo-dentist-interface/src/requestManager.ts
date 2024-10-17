/*
 * Inspired by the now archived API Gateway
 * https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-10/dentigo-api-gateway
 */

import MqttRequest from './MqttRequest.js'

let request: MqttRequest

const REQUEST_TIMEOUT = 7000

export function getResponse(): Promise<string> {
    request = new MqttRequest()

    request.timeoutID = setTimeout(() => {
        request.timeOut()
        request = null
    }, REQUEST_TIMEOUT)

    return request.promise
}

export function resolveResponse(response: string) {
    if (request) {
        request.resolve(response)
        request = null
    }
}
