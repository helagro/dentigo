import { AppDataSource } from '../data-source'
import { MQTTError } from '../exceptions/MQTTError'
import { Dentist } from '../entities/Dentist'
import { Clinic } from '../entities/Clinic'
import bcrypt from 'bcrypt'
import { sign } from '../services/encryptionService'

// Get Dentist repository from the data source
const dentistRepository = AppDataSource.getRepository(Dentist)
// Get Clinic repository from the data source
const clinicRepository = AppDataSource.getRepository(Clinic)

/*------------------------------Authentication--------------------------------*/

async function authenticateDentist(message: string) {
    const { email, password } = JSON.parse(message)

    const dentist = await dentistRepository.findOne({
        where: { email: email },
    })

    if (!dentist) {
        throw new Error('Email not registered')
    }

    if (await bcrypt.compare(password, dentist.password)) {
        const signature = sign(dentist.id)

        return {
            email: dentist.email,
            clinicID: dentist.clinicID,
            dentistID: dentist.id,
            signature: signature,
        }
    } else {
        throw new Error('Incorrect password!')
    }
}
// Method to create a new dentist
async function createNewDentist(message: string) {
    try {
        // Parse the incoming message or perform any necessary validations
        const newDentistData = JSON.parse(message)

        // Hash the password
        newDentistData.password = await bcrypt.hash(newDentistData.password, 10)

        // Create a new Dentist entity
        const newDentist = dentistRepository.create(newDentistData)

        // Save the new Dentist entity to the database
        const res = await dentistRepository.save(newDentist)

        return {
            success: true,
            message: 'Dentist added successfully',
            newDentist: res,
        }
    } catch (err) {
        return {
            error: {
                code: 500,
                message: err.message,
            },
        }
    }
}

// Method to get all dentists
async function getAllDentists() {
    try {
        const allDentists = await dentistRepository.find({})
        if (!allDentists.length || allDentists.length === 0) {
            throw new MQTTError({
                code: 404,
                message: 'No dentists were found',
            })
        }
        // Remove 'password' field from each dentist object
        const sanitizedDentists = allDentists.map(dentist => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...sanitizedDentist } = dentist
            return sanitizedDentist
        })
        return sanitizedDentists
    } catch (err) {
        if (err instanceof MQTTError) {
            return {
                error: {
                    code: err.code,
                    message: err.message,
                },
            }
        } else {
            return {
                error: {
                    code: 500,
                    message: err.message,
                },
            }
        }
    }
}

// Method to get dentists by ID or IDs
async function getDentistsByIdOrIds(message: string) {
    try {
        const data = JSON.parse(message)
        const dentistID = data.dentistID
        const dentistIDs = data.dentistIDs

        // Check if either dentistID or dentistIDs array exists before proceeding
        if (
            !dentistID &&
            (!dentistIDs ||
                !Array.isArray(dentistIDs) ||
                dentistIDs.length === 0)
        ) {
            throw new MQTTError({
                code: 400,
                message:
                    'Missing or invalid dentistID or dentistIDs in the message',
            })
        }

        // If dentistID is provided, return a single dentist
        if (dentistID) {
            const singleDentist = await dentistRepository.findOne({
                where: { id: dentistID },
            })

            // If the dentist is not found, throw an error
            if (!singleDentist) {
                throw new MQTTError({
                    code: 404,
                    message: 'Dentist not found',
                })
            }

            // Remove 'password' field from singleDentist
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...sanitizedSingleDentist } = singleDentist
            return sanitizedSingleDentist
        }

        // If dentistIDs array is provided, return an array of dentists
        const dentists = await dentistRepository.findByIds(dentistIDs)

        // If no dentists are found, throw an error
        if (!dentists || dentists.length === 0) {
            throw new MQTTError({
                code: 404,
                message: 'No dentists were found for the provided dentistIDs',
            })
        }

        // Remove 'password' field from each dentist in the array
        const sanitizedDentists = dentists.map(dentist => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...sanitizedDentist } = dentist
            return sanitizedDentist
        })
        return sanitizedDentists
    } catch (err) {
        if (err instanceof MQTTError) {
            return {
                error: {
                    code: err.code,
                    message: err.message,
                },
            }
        } else {
            return {
                error: {
                    code: 500,
                    message: err.message,
                },
            }
        }
    }
}

// Method to update an existing dentist by ID
async function updateDentistById(message: string) {
    try {
        const updatedData = JSON.parse(message)
        const dentistID = updatedData.dentistID
        // Check if dentistID exists before proceeding
        if (!dentistID) {
            throw new MQTTError({
                code: 400,
                message: 'Missing or invalid dentistID in the message',
            })
        }
        // Find the dentist by ID
        const dentistToUpdate = await dentistRepository.findOne({
            where: { id: dentistID },
        })

        // If the dentist is not found, throw an error
        if (!dentistToUpdate) {
            throw new MQTTError({
                code: 404,
                message: 'Dentist not found',
            })
        }

        // Update the dentist with the provided data
        dentistRepository.merge(dentistToUpdate, updatedData)

        // Save the updated dentist entity to the database
        const updatedDentist = await dentistRepository.save(dentistToUpdate)

        return {
            success: true,
            message: 'Dentist updated successfully',
            updatedDentist: updatedDentist,
        }
    } catch (err) {
        return {
            error: {
                code: 500,
                message: err.message,
            },
        }
    }
}

// Method to delete a dentist by ID
async function deleteDentistById(message: string) {
    try {
        const jsonMessage = JSON.parse(message)
        const dentistID = jsonMessage.dentistID
        // Check if dentistID exists before proceeding
        if (!dentistID) {
            throw new MQTTError({
                code: 400,
                message: 'Missing or invalid dentistID in the message',
            })
        }
        // Find the dentist by ID
        const dentistToDelete = await dentistRepository.findOne({
            where: { id: dentistID },
        })

        // If the dentist is not found, throw an error
        if (!dentistToDelete) {
            throw new MQTTError({
                code: 404,
                message: 'Dentist not found',
            })
        }

        // Delete the dentist from the database
        await dentistRepository.remove(dentistToDelete)

        return {
            success: true,
            message: 'Dentist deleted successfully',
            deletedDentist: dentistToDelete,
        }
    } catch (err) {
        if (err instanceof MQTTError) {
            return {
                error: {
                    code: err.code,
                    message: err.message,
                },
            }
        } else {
            return {
                error: {
                    code: 500,
                    message: err.message,
                },
            }
        }
    }
}

async function getRequestNames(message: string) {
    try {
        const { dentistID, clinicID } = JSON.parse(message)
        // Check if dentistID exists before proceeding
        if (!dentistID) {
            throw new MQTTError({
                code: 400,
                message: 'Missing or invalid dentistID in the message',
            })
        }
        // Find the dentist by ID
        const dentist = await dentistRepository.findOne({
            where: { id: dentistID },
        })
        // Check if clinicID exists before proceeding
        if (!clinicID) {
            throw new MQTTError({
                code: 400,
                message: 'Missing or invalid clinicID in the message',
            })
        }
        // Find the clinic by ID
        const clinic = await clinicRepository.findOne({
            where: { id: clinicID },
        })

        // If either the dentist or clinic is not found, throw an error
        if (!dentist || !clinic) {
            throw new MQTTError({
                code: 404,
                message: 'Dentist or clinic not found',
            })
        }

        // Return the names
        return {
            dentistName: `${dentist.firstName} ${dentist.lastName}`,
            clinicName: clinic.name,
        }
    } catch (err) {
        if (err instanceof MQTTError) {
            return {
                error: {
                    code: err.code,
                    message: err.message,
                },
            }
        } else {
            return {
                error: {
                    code: 500,
                    message: err.message,
                },
            }
        }
    }
}

export default {
    authenticateDentist,
    createNewDentist,
    getAllDentists,
    getDentistsByIdOrIds,
    updateDentistById,
    deleteDentistById,
    getRequestNames,
}
