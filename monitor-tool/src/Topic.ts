export enum SubTopic {
    CONNECTED_AMT = '$SYS/broker/clients/connected',

    MONITOR = 'monitor/#',
    BOOKING_STATS = 'monitor/statistics/booking',
    USER_STATS = 'monitor/statistics/user',
}

export enum PubTopic {
    BOOKING_STATS = 'booking/statistics',
    USER_STATS = 'users/statistics',
}
