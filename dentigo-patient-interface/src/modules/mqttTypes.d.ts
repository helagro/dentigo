export interface SubscribeOptions {
    qos: mqtt.QoS
    nl: unknown
    rap: unknown
    rh: unknown
    properties: object
}
export interface PublishOptions {
    qos: mqtt.QoS
    retain: unknown
    dup: unknown
    properties: object
}
