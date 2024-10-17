# Clinic Service

The Clinic Service is responsible for handling retrieve operations related to clinics and dentists. It also provides a secure authentication service for dentists, ensuring that only authorized individuals can access sensitive information. The service communicates over MQTT (Message Queuing Telemetry Transport) and listens to specific topics for incoming messages.

## MQTT Configuration

The Clinic Service connects to an MQTT broker to send and receive messages. The MQTT broker URI and topics are configured through environment variables. By default, it connects to a secure WebSocket (wss) MQTT broker.

### MQTT Broker Configuration

- **Broker URI**: `process.env.MQTT_URI` (default: 'wss://mqtt.jnsl.tk')
- **Topic**: 'clinic/#'

## Message Handling

The Clinic Service subscribes to the MQTT topics under 'clinic/'. It handles incoming messages by delegating the requests to the appropriate controller methods.

### Dentists

#### Authentication Dentist

- **Topic**: 'clinic/dentists/auth'
- Authenticate dentists using email and password.
- Encrypt and decrypt messages for secure communication.
- Publish authentication responses to specific client topics.

#### Getting All Dentists

- **Topic**: 'clinic/dentists/get/all'
- **Payload**: "..."

#### Getting a Specific Dentist

- **Topic**: 'clinic/dentists/get'
- **Payload**: Dentist ID as a JSON


### Clinics


#### Getting All Clinics

- **Topic**: 'clinic/clinics/get/all'
- **Payload**: "..."

#### Getting a Specific Clinic

- **Topic**: 'clinic/clinics/get'
- **Payload**: Clinic ID as a JSON.


#### Requesting Dentist and Clinic Names

- **Topic**: 'clinic/notifications/requestNames'
- **Payload**: JSON object containing the dentistID and clinicID.

    ```json
    {
        "clientID": "<Client ID>",
        "dentistID": "<Dentist ID>"
    }
    ```

## Setup

1. Install dependencies: `npm install`
2. Set environment variables, including `MQTT_URI`.
3. Start the Clinic Service: `npm run dev`

## Additional Notes

- The Clinic Service relies on controllers (`DentistController` and `ClinicController`) to handle the logic for dentists and clinics, respectively.
- The service uses asynchronous message handling to publish responses back to the MQTT topics.
- Ensure proper security measures, such as encryption, are implemented when handling sensitive information over MQTT.

Feel free to customize and extend the service to meet specific requirements or add new features.