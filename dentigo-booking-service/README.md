# DENTIGO - Booking Service

The booking service is responsible for all operations related to booking a 
timeslot. It handles the following:
- Retrieve all timeslots
- Create new timeslot
- ...

> NOTE: the above list is expected to grow

## Expected MQTT message format:

The booking service listens on ```booking/#```. The message should be a string in the following format:

```<encrypted AES key>,<encrypted payload>,<iv>```

## Expected payload format:

The contents of the payload depend on the type of operation. 

### Creating a new time slot:

For creating a new time slot, a message with the following payload should be 
published on ```booking/timeslot/create```:

```json
{
    "clientID": "<Client ID to respond to>",
    "timeSlotStart": "<Timestamp representing the start of the timeslot>",
    "timeSlotEnd": "<Timestamp representing the end of the timeslot>",
    "clinicID": "<The ID of the clinic associated with the timeslot>",
    "dentistID": "<The ID of the dentist associated with the timeslot>"
}
```

An example of a payload might look like this:

```json
{
    "clientID": "ABCD1234",
    "timeSlotStart": "2023-12-12T14:00:00.01:0Z",
    "timeSlotEnd": "2023-12-12T14:00:00.010Z",
    "clinicID": "ABCDE1234",
    "dentistID": "ABCDE1234"
}
```

### Retrieving all time slots:

For retrieving all time slots, a message with just the clientID should be 
published on ```booking/timeslot/get/all```. An example of what such a message
might look like:

```json
{
    "clientID": "ABCD1234"
}
```
The response will be published on ```clients/<clientID>/booking/timeslot/get```.

### Retrieving time slots per clinic:

For retrieving all time slots per clinic, a message with the clientID and the
clinicID should be published on ```booking/timeslot/get/byClinic```. An example of what
such a message might look like:

```json
{
    "clientID": "ABCD1234", 
    "clinicID": "ABCD1234"
}
```
The response will be published on ```clients/<clientID>/booking/timeslot/get```, in the following format:

```json
{
    "clinicID": "<clinicID>",
    "timeSlots": [
        {
            <timeSlotOne>
        },
        {
            <timeSlotTwo>
        }
    ]
}
```

### Retrieving time slots per dentist:

For retrieving all time slots per dentist, a message with the clientID and the
dentistID should be published on ```booking/timeslot/get/byDentist```. An example of what
such a message might look like:

```json
{
    "clientID": "ABCD1234", 
    "dentistID": "ABCD1234"
}
```
The response will be published on ```clients/<clientID>/booking/timeslot/get```, in the following format:

```json
{
    "dentistID": "<dentistID>",
    "timeSlots": [
        {
            <timeSlotOne>
        },
        {
            <timeSlotTwo>
        }
    ]
}
```

