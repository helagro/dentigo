/* LOGO */
export const printLogo = () => {
    console.clear()
    console.log(
        `
██████╗ ███████╗███╗   ██╗████████╗██╗ ██████╗  ██████╗ 
██╔══██╗██╔════╝████╗  ██║╚══██╔══╝██║██╔════╝ ██╔═══██╗
██║  ██║█████╗  ██╔██╗ ██║   ██║   ██║██║  ███╗██║   ██║
██║  ██║██╔══╝  ██║╚██╗██║   ██║   ██║██║   ██║██║   ██║
██████╔╝███████╗██║ ╚████║   ██║   ██║╚██████╔╝╚██████╔╝
╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝ ╚═════╝  ╚═════╝ 
========================================================
********** DENTIST API COMMAND LINE INTERFACE **********
========================================================
        `,
    )
}

export const delay = (delayInms: number) => {
    return new Promise(resolve => setTimeout(resolve, delayInms))
}

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
        timeZone: 'Europe/London',
    }
    const formattedDate = new Intl.DateTimeFormat('sv-SE', options).format(date)
    return formattedDate
}

export const getTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/London',
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
