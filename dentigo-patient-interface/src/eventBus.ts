/**
 * Inspired by JavaScript EventBus Example - Subscribe/Publish Listeners
 * Author: Ramesh Fadatare
 * Url: https://www.javaguides.net/2019/06/javascript-eventbus-example.html
 */
type ListenerFunction = (data: { id: string; message: string }) => void
const eventBus: { [eventName: string]: ListenerFunction[] } = {}

export function on(eventName: string, listener: ListenerFunction): void {
    if (!eventBus[eventName]) {
        eventBus[eventName] = []
    }
    eventBus[eventName].push(listener)
}

export function emit(
    eventName: string,
    data: { id: string; message: string },
): void {
    if (!eventBus[eventName]) {
        return
    }
    for (const listener of eventBus[eventName]) {
        listener(data)
    }
}
