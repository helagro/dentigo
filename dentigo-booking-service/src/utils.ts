export const parseDate = (date: string): number => {
    return Date.parse(date)
}

export const convertTimeStamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    }
    const formattedDate = new Intl.DateTimeFormat('sv-SE', options).format(date)
    return formattedDate
}

export const getTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
    }
    return date.toLocaleTimeString('sv-SE', options)
}

export const getTimeSlotDate = (
    timeSlotStart: string,
    timeSlotEnd: string,
): string => {
    return `${convertTimeStamp(parseDate(timeSlotStart))} - ${getTime(
        parseDate(timeSlotEnd),
    )}`
}
