import * as mqtt from 'mqtt'
import dentist from '../controllers/DentistController'
import clinic from '../controllers/ClinicController'
import { decrypt, encryptAES } from './encryptionService'

export class MqttService {
    private client: mqtt.MqttClient

    constructor() {
        // Constants
        const mqttBrokerURI = process.env.MQTT_URI || 'wss://mqtt.jnsl.tk'
        const mqttTopic = 'clinic/#'

        // Connect to MQTT broker
        this.client = mqtt.connect(mqttBrokerURI)

        this.client.on('connect', () => {
            this.client.subscribe(mqttTopic, { qos: 1 })
            console.log(
                `Clinic service listening for messages on topic '${mqttTopic}' from '${mqttBrokerURI}'...`,
            )
        })

        this.client.on('message', this.handleMessage.bind(this))
    }

    public start(): void {
        // Additional setup logic if needed
    }

    private async handleMessage(topic: string, message: Buffer): Promise<void> {
        console.log(message.toString())

        const publishResponse = async (
            response: unknown,
            responseTopic: string,
        ): Promise<void> => {
            console.log(response)
            this.client.publish(
                responseTopic,
                JSON.stringify(response, null, 4),
                { qos: 2 },
            )
        }

        // Dentists==================================================//

        try {
            switch (topic) {
                case 'clinic/dentists/auth': {
                    const { content, keyAES } = decrypt(message.toString())
                    try {
                        const parsedMessage = JSON.parse(content)

                        const res = await dentist.authenticateDentist(content)
                        console.log(content)

                        publishResponse(
                            encryptAES(JSON.stringify(res), keyAES),
                            `clients/${parsedMessage.clientID}/auth`,
                        )
                    } catch (err) {
                        if (err instanceof SyntaxError) {
                            // no topic to respond to
                            console.error(err)
                        } else {
                            const parsedMessage = JSON.parse(content)
                            const encryptedErr = encryptAES(
                                `{ "error": "${err.message}" }`,
                                keyAES,
                            )
                            publishResponse(
                                encryptedErr,
                                `clients/${parsedMessage.clientID}/auth`,
                            )
                        }
                    }
                    break
                }
                case 'clinic/dentists/get/all':
                    publishResponse(
                        await dentist.getAllDentists(),
                        'clinic/dentists/get/all/response',
                    )
                    break
                case 'clinic/dentists/get': // Require dentistID or dentistIDs
                    publishResponse(
                        await dentist.getDentistsByIdOrIds(message.toString()),
                        'clinic/dentists/get/response',
                    )
                    break
                // Clinics ==========================================================//
                case 'clinic/clinics/get/all':
                    publishResponse(
                        await clinic.getAllClinics(),
                        'clinic/clinics/get/all/response',
                    )
                    break
                case 'clinic/clinics/get': // Require clinicID or clinicIDs
                    publishResponse(
                        await clinic.getClinicsByIdOrIds(message.toString()),
                        'clinic/clinics/get/response',
                    )
                    break
                    break
                //Notifiction Service get requestNames(dentist and clinic)
                case 'clinic/notifications/requestNames':
                    publishResponse(
                        await dentist.getRequestNames(message.toString()),
                        'clinic/getRequestedNames',
                    )
                    break
            }
        } catch (err) {
            console.error(err)
        }
    }
}
