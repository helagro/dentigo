# DENTIGO - Notification Service

The DENTIGO Notification Service is responsible for handling notifications related to patient bookings, cancellations(by patient or dentist), and new released timeslots. It listens for MQTT messages on specific topics and processes notifications accordingly.

## Feature

- Create and send successful booking notifications to patients.
- Create and send cancellation notifications if a booked timeslot gets cancelled.
- Retrieve dentist and clinic names for new released timeslots and create/send notifications to subscribed users.
- Remove patients subscriptions when they unsubscribe from clinics.
- Retrieve all unread notifications for a patient. (with encryption)
- Update notification status to read. (with encryption)

## MQTT Topics

The Notification Service listens for messages on the following MQTT topics:

### `booking/createBooking`: Triggered when a booking is successfully created.

#### Expected MQTT message format:

```json
{
    "payload": {
        "timeslot": "Appointment-related time slot",
        "email": "The email address of the user",
        "userID": "The ID of a patient"
    }
}
```
Example:

```json
{
    "payload": {
        "timeslot": "20 januari 2024 kl. 10:00 - 12:00",
        "email": "patient1@gmail.com",
        "userID": "R8uTn1Tg/g2RBT04/79HNIa6JZcBXshLAOokKtAtUVc="
    }
}
```

### `booking/cancelBooking`: Triggered when a booked timeslot is cancelled.

#### Expected MQTT message format:

```json
{
    "payload": {
        "timeslot": "Appointment-related time slot",
        "email": "The email address of the user",
        "userID": "The ID of a patient"
    }
}
```
Example:

```json
{
    "payload": {
        "timeslot": "20 januari 2024 kl. 10:00 - 12:00",
        "email": "patient1@gmail.com",
        "userID": "R8uTn1Tg/g2RBT04/79HNIa6JZcBXshLAOokKtAtUVc="
    }
}
```
### `booking/releaseNewTimeslot`: Triggered when a new timeslot is released for booking.
- Upon receiving this message, the service retrieves dentist and clinic names for the new released timeslot.
- Subsequently, it listens to the `clinic/getRequestedNames` topic to receive the names and processes notifications to send to subscribed users.

#### Expected MQTT message format:

```json
{
    "payload": {
        "timeslot": "Appointment-related time slot",
        "clinicID": "The unique ID of a clinic",
        "dentistID": "The unique ID of a dentist"
    }
}
```
Example:

```json
{
    "payload": {
        "timeslot": "20 januari 2024 kl. 10:00 - 12:00",
        "clinicID": "d1eb84f9-3292-49ad-8f86-b2ea6d6b0f9c",
        "dentistID": "bfd69dc0-85c3-433f-9d41-6abf7b5f74a8"
    }
}
```
### `patientUI/subscribeNewTimeslot`: Triggered when a user subscribes to clinics.

#### Expected MQTT message format:

```json
{
    "payload": {
        "email": "The email address of the user",
        "clinicID": "The unique ID of a clinic",
        "clientID": "The unique ID of an instance of the browser window"
    }
}
```
Example:

```json
{
    "payload": {
        "email": "patient1@gmail.com",
        "clinicID": "3ec94d16-2487-492b-a7f2-b96cc7232556",
        "clientID": "d1eb84f9-3292-49ad-8f86-b2ea6d6b0f9c"
    }
}
```
### `patientUI/unsubscribeNewTimeslot`: Triggered when a user unsubscribes from clinics.

#### Expected MQTT message format:

```json
{
    "payload": {
        "email": "The email address of the user",
        "clinicID": "The unique ID of a clinic",
        "clientID": "The unique ID of an instance of the browser window"
    }
}
```
Example:

```json
{
    "payload": {
        "email": "patient1@gmail.com",
        "clinicID": "3ec94d16-2487-492b-a7f2-b96cc7232556",
        "clientID": "d1eb84f9-3292-49ad-8f86-b2ea6d6b0f9c"
    }
}
```
### `patientUI/retrieveAllNotifications`: Triggered to retrieve all unread notifications for a specific user.

#### Expected MQTT message format:

```json
{
    "payload": {
        "userID": "The unique ID of a clinic",
        "clientID": "The unique ID of an instance of the browser window"
    }
}
```
Example:

```json
{
    "payload": {
        "userID": "The unique ID of a clinic",
        "clientID": "d1eb84f9-3292-49ad-8f86-b2ea6d6b0f9c"
    }
}
```
### `patientUI/updateReadNotifications`: Triggered to update an unread notification to a read status.

#### Expected MQTT message format:

```json
{
    "payload": {
        "userID": "The unique ID of a clinic",
        "notificationID": "The unique ID of a notification",
        "clientID": "The unique ID of an instance of the browser window"
    }
}
```
Example:

```json
{
    "payload": {
        "userID": "R8uTn1Tg/g2RBT04/79HNIa6JZcBXshLAOokKtAtUVc=",
        "notificationID": "6649a517-661d-4095-bf0d-1246c58dcab1",
        "clientID": "d1eb84f9-3292-49ad-8f86-b2ea6d6b0f9c"
    }
}
```

## Setup

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

### Installation

1. Install the dependencies: `npm i`
2. Create a .env file in the root of the project (set environment variables)