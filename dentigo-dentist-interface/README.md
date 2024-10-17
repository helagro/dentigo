# DENTIGO - Dentist Interface

The Dentist Interface is a CLI testing tool for testing and the demonstration of the features of the Dentist API. 

## Usage

Start with

```npm run start```

## Functionality

- Log in with email and password
- Create new time slots
- Get info about time slots
    - View bookings
    - View Cancellations (and optionally dismiss them)
- Cancel time slots
- View info about currently logged in dentist

## Requirements

- NodeJS
- A modern terminal emulator

## Running on Windows

Certain functionality (Everything under the get info about time slots menu option) only works on Linux and macOS, since it relies on 'less', a pager that comes built-in with Unix-based systems. If you wish to use the application on Windows, you'll need to run it inside WSL.
