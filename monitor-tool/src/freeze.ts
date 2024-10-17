let promise: Promise<void> = Promise.resolve()

export function getPromise() {
    return promise
}

export function delay(ms: number) {
    promise = new Promise<void>((resolve, _) => {
        setTimeout(() => resolve(), ms)
    })
}
