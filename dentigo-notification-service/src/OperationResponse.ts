export enum StatusCode {
    SUCCESS = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    CONFLICT = 409,
    ERROR = 500,
}

export class OperationResponse {
    public statusCode: StatusCode
    public message: string

    constructor(statusCode: StatusCode, message: string) {
        this.statusCode = statusCode
        this.message = message
    }

    toJSON() {
        return JSON.stringify({
            statusCode: this.statusCode,
            message: this.message,
        })
    }
}
