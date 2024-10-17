import { AppDataSource } from '../data-source'
import { Clinic } from '../entities/Clinic'
import { MQTTError } from '../exceptions/MQTTError'

// Get Clinic repository from the data source
const clinicRepository = AppDataSource.getRepository(Clinic)

// Method to create a new clinic
async function createNewClinic(message: string) {
    try {
        // Parse the incoming message or perform any necessary validations
        const newClinicData = JSON.parse(message)

        // Create a new Clinic entity
        const newClinic = clinicRepository.create(newClinicData)

        // Save the new Clinic entity to the database
        await clinicRepository.save(newClinic)

        return {
            success: true,
            message: 'Clinic added successfully',
            newClinic: newClinicData,
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

// Method to get all clinics
async function getAllClinics() {
    try {
        const allClinic = await clinicRepository.find({})
        if (!allClinic.length || allClinic.length === 0) {
            throw new MQTTError({
                code: 404,
                message: 'No clinics were found',
            })
        }
        return allClinic
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

// Method to get clinics by ID or IDs
async function getClinicsByIdOrIds(message: string) {
    try {
        const data = JSON.parse(message)
        const clinicID = data.clinicID
        const clinicIDs = data.clinicIDs

        // Check if either clinicID or clinicIDs array exists before proceeding
        if (
            !clinicID &&
            (!clinicIDs || !Array.isArray(clinicIDs) || clinicIDs.length === 0)
        ) {
            throw new MQTTError({
                code: 400,
                message:
                    'Missing or invalid clinicID or clinicIDs in the message',
            })
        }

        // If clinicID is provided, return a single clinic
        if (clinicID) {
            const singleClinic = await clinicRepository.findOne({
                where: { id: clinicID },
            })

            // If the clinic is not found, throw an error
            if (!singleClinic) {
                throw new MQTTError({
                    code: 404,
                    message: 'Clinic not found',
                })
            }

            return singleClinic
        }

        // If clinicIDs array is provided, return an array of clinics
        const clinics = await clinicRepository.findByIds(clinicIDs)

        // If no clinics are found, throw an error
        if (!clinics || clinics.length === 0) {
            throw new MQTTError({
                code: 404,
                message: 'No clinics were found for the provided clinicIDs',
            })
        }

        return clinics
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

// Method to update an existing clinic by ID
async function updateClinicById(message: string) {
    try {
        const updatedData = JSON.parse(message)
        const clinicID = updatedData.clinicID
        // Check if clinicID exists before proceeding
        if (!clinicID) {
            throw new MQTTError({
                code: 400,
                message: 'Missing or invalid clinicID in the message',
            })
        }
        // Find the clinic by ID
        const clinicToUpdate = await clinicRepository.findOne({
            where: { id: clinicID },
        })

        // If the clinic is not found, throw an error
        if (!clinicToUpdate) {
            throw new MQTTError({
                code: 404,
                message: 'Clinic not found',
            })
        }

        // Update the clinic with the provided data
        clinicRepository.merge(clinicToUpdate, updatedData)

        // Save the updated clinic entity to the database
        const updatedClinic = await clinicRepository.save(clinicToUpdate)

        return {
            success: true,
            message: 'Clinic updated successfully',
            updatedClinic: updatedClinic,
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

// Method to delete a clinic by ID
async function deleteClinicById(message: string) {
    try {
        const jsonMessage = JSON.parse(message)
        const clinicID = jsonMessage.clinicID
        // Check if clinicID exists before proceeding
        if (!clinicID) {
            throw new MQTTError({
                code: 400,
                message: 'Missing or invalid clinicID in the message',
            })
        }
        // Find the clinic by ID
        const clinicToDelete = await clinicRepository.findOne({
            where: { id: clinicID },
        })

        // If the clinic is not found, throw an error
        if (!clinicToDelete) {
            throw new MQTTError({
                code: 404,
                message: 'Clinic not found',
            })
        }

        // Delete the clinic from the database
        await clinicRepository.remove(clinicToDelete)

        return {
            success: true,
            message: 'Clinic deleted successfully',
            deletedClinic: clinicToDelete,
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
    createNewClinic,
    getAllClinics,
    getClinicsByIdOrIds,
    updateClinicById,
    deleteClinicById,
}
