import { delay, printLogo } from './utils.js'
import inquirer from 'inquirer'
import ora from 'ora'
import boxen from 'boxen'
import pager from 'node-pager'
import PressToContinuePrompt from 'inquirer-press-to-continue'
import type { KeyDescriptor } from 'inquirer-press-to-continue'
import {
    createNewTimeSlot,
    dismissCancelledSlots,
    getAllTimeSlots,
    getAllBookedSlots,
    getAllCancelledSlots,
    mapTimeSlotDates,
    cancelTimeSlot,
    mapBookedSlots,
} from './services/timeSlotService.js'
import { credentials } from './types/types.js'
import { authDentist, store } from './services/loginService.js'

type newSlotAnswers = {
    startDate: string
    endDate: string
}

type loginAnswers = {
    email: string
    password: string
}

export const loginMenu = async () => {
    printLogo()
    await delay(750)
    await inquirer
        .prompt([
            {
                type: 'input',
                name: 'email',
                message: 'Please enter your email address',
            },
            {
                type: 'password',
                name: 'password',
                message: 'Please enter your password',
            },
        ])
        .then(async (answers: loginAnswers) => {
            const spinner = ora('Authenticating...\n').start()
            const cred: credentials = {
                email: answers.email,
                password: answers.password,
            }
            await authDentist(cred)
                .then(async authRes => {
                    if (authRes.isSuccessful === true) {
                        spinner.succeed('\nLog in successful!')
                        store.email = authRes.email
                        store.dentistID = authRes.dentistID
                        store.clinicID = authRes.clinicID
                        store.signature = authRes.signature
                        await delay(1000)
                        await showMainMenu()
                    } else {
                        spinner.fail('\nLog in failed, try again!')
                        console.log(authRes.error)
                        await delay(3000)
                        await loginMenu()
                    }
                })
                .catch(err => {
                    spinner.fail(err)
                    process.exit(0)
                })
        })
        .catch((err): void => {
            console.error(err)
        })
}

export const createTimeSlotMenu = async () => {
    inquirer.registerPrompt('press-to-continue', PressToContinuePrompt)
    await inquirer
        .prompt([
            {
                type: 'input',
                name: 'startDate',
                message:
                    "Please enter the starting date for the time slot you'd like to create",
            },
            {
                type: 'input',
                name: 'endDate',
                message:
                    "Please enter the ending date for the time slot you'd like to create",
            },
        ])
        .then(async (answers: newSlotAnswers) => {
            const spinner = ora('Saving...\n').start()

            try {
                const result = await createNewTimeSlot(answers)
                console.log(
                    boxen(JSON.stringify(JSON.parse(result), null, 4), {
                        padding: 1,
                    }) + '\n',
                )
                spinner.succeed('\nSuccessfully created new timeslot')
            } catch (err) {
                spinner.fail('\n' + boxen(err.message, { padding: 1 }))
                await delay(1000)
            }

            await inquirer.prompt<{ key: KeyDescriptor }>({
                name: 'key',
                type: 'press-to-continue',
                anyKey: true,
                pressToContinueMessage: 'Press a key to continue...',
            })
        })
        .catch((err): void => {
            console.error(err)
        })
}

export const getInfoMenu = async () => {
    printLogo()

    await inquirer
        .prompt([
            {
                type: 'list',
                name: 'option',
                message: 'Please pick an option',
                choices: [
                    {
                        name: 'View bookings',
                        value: 'viewBookings',
                    },
                    {
                        name: 'View cancellations',
                        value: 'viewCancel',
                    },
                    {
                        name: 'Back to main menu',
                        value: 'backToMenu',
                    },
                    {
                        name: 'Exit',
                        value: 'exit',
                    },
                ],
            },
        ])
        .then(async answers => {
            switch (answers.option) {
                case 'viewBookings': {
                    const spinner = ora(
                        'Getting all booked time slots...',
                    ).start()

                    await getAllBookedSlots()
                        .then(async res => {
                            spinner.succeed('Done!')
                            await delay(200)

                            await pager(
                                JSON.stringify(JSON.parse(res), null, 4),
                            ).then(() => {
                                console.log('Exited')
                            })
                        })
                        .catch(err => {
                            spinner.fail(err)
                        })
                    await delay(1000)
                    break
                }
                case 'viewCancel': {
                    const spinner = ora(
                        'Getting all cancelled time slots...',
                    ).start()

                    await getAllCancelledSlots()
                        .then(async res => {
                            spinner.succeed('Done!')
                            await delay(200)
                            const parsedRes = JSON.parse(res)
                            if (parsedRes.timeSlots.length == 0) {
                                console.log(
                                    'There are currenctly no new cancellations',
                                )
                                await delay(3000)
                            } else {
                                await pager(
                                    JSON.stringify(parsedRes, null, 4),
                                ).then(async () => {
                                    console.log('Exited')
                                    await dismissCancelledMenu()
                                })
                            }
                        })
                        .catch(err => {
                            spinner.fail(err)
                        })
                    await delay(1000)
                    break
                }
                case 'backToMenu': {
                    await showMainMenu()
                    break
                }
                case 'exit': {
                    console.log('Bye!')
                    process.exit(0)
                }
            }
        })
        .catch(err => {
            console.error(err)
        })
}

export const dismissCancelledMenu = async () => {
    printLogo()
    await inquirer
        .prompt([
            {
                type: 'confirm',
                name: 'dismiss',
                message:
                    'Would you like to dismiss all cancellations? (So they will not show up in future queries)',
            },
        ])
        .then(async answers => {
            if (answers.dismiss == true) {
                const spinner = ora(
                    'Dismissing all cancelled time slots',
                ).start()
                await dismissCancelledSlots()
                    .then(async res => {
                        spinner.succeed(JSON.parse(res).message)
                    })
                    .catch(async err => {
                        spinner.fail(err)
                    })
            }
        })
        .catch(err => {
            console.log(err)
        })
}

export const cancelMenu = async () => {
    printLogo()

    const spinner = ora('Loading time slots...').start()

    // Get all bookings by dentist
    const res = await getAllTimeSlots()
    spinner.succeed('Done')

    // Remap them for inquirer
    const dates = mapTimeSlotDates(res.timeSlots)

    const isBookedMap = mapBookedSlots(res.timeSlots)

    // List all of them, select one to delete
    await inquirer
        .prompt([
            {
                type: 'list',
                name: 'option',
                message: "Please select a time slot you'd like to cancel",
                choices: dates,
            },
        ])
        .then(async answers => {
            await inquirer
                .prompt([
                    {
                        type: 'confirm',
                        name: 'value',
                        message: 'Are you sure?',
                    },
                ])
                .then(async confirm => {
                    if (confirm.value) {
                        // Confirm booked slot again
                        if (isBookedMap.get(answers.option)) {
                            await inquirer
                                .prompt([
                                    {
                                        type: 'confirm',
                                        name: 'value',
                                        message:
                                            'This time slot has been booked already. Are your really sure you want to cancel it?',
                                    },
                                ])
                                .then(async doubleConfirm => {
                                    if (!doubleConfirm.value) {
                                        await showMainMenu()
                                    }
                                })
                        }

                        // Cancel time slot

                        const spinner = ora('Cancelling time slot...').start()

                        await cancelTimeSlot(answers.option)
                            .then(res => {
                                const parsedRes = JSON.parse(res)
                                // Show response whether it was successful or not
                                if (parsedRes.isSuccessful) {
                                    spinner.succeed(
                                        'Time slot cancelled successfully',
                                    )
                                } else {
                                    spinner.fail(
                                        'There was an error cancelling your time slot, please try again later',
                                    )
                                }
                            })
                            .catch(err => spinner.fail(err))
                    } else {
                        await showMainMenu()
                    }
                })
        })

    await delay(3000)
}

export const showDentistInfo = async () => {
    inquirer.registerPrompt('press-to-continue', PressToContinuePrompt)

    console.log(`Currently logged in dentist information:
clientID: ${store.clientID}
email: ${store.email} 
dentistID: ${store.dentistID}
clinicID: ${store.clinicID} 
signature: ${store.signature} 
`)

    await inquirer.prompt<{ key: KeyDescriptor }>({
        name: 'key',
        type: 'press-to-continue',
        anyKey: true,
        pressToContinueMessage: 'Press a key to continue...',
    })
}

export const showMainMenu = async () => {
    printLogo()
    await inquirer
        .prompt([
            {
                type: 'list',
                name: 'option',
                message: "Please select what you'd like to do",
                choices: [
                    {
                        name: 'Create new time slot',
                        value: 'createNew',
                    },
                    {
                        name: 'Get info about time slots',
                        value: 'getInfo',
                    },
                    {
                        name: 'Cancel time slots',
                        value: 'cancel',
                    },
                    {
                        name: 'Show dentist info',
                        value: 'dentist',
                    },
                    {
                        name: 'Exit',
                        value: 'exit',
                    },
                ],
            },
        ])
        .then(async answers => {
            switch (answers.option) {
                case 'createNew': {
                    await createTimeSlotMenu()
                    break
                }
                case 'getInfo': {
                    await getInfoMenu()
                    break
                }
                case 'cancel': {
                    await cancelMenu()
                    break
                }
                case 'dentist': {
                    await showDentistInfo()
                    break
                }
                case 'exit': {
                    console.log('Bye!')
                    process.exit(0)
                }
            }
            await showMainMenu()
        })
        .catch(err => {
            console.error(err)
        })
}
