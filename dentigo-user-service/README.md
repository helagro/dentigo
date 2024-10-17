# DENTIGO - User Service

## Description

This service enables the user to log in using BankID. When logged in, it will send take the social security number from the BankID API. It will generate a hash from it, then sign that hash with the private RSA signing key. The signature and hash will be sent to the client, along with other data from the BankID API.

## Installation

```bash
npm i --force
mkdir config
touch config/privateEncrypt.pem
touch config/privateSign.pem
```
(The --force flag is needed due to some dev-dependencies from the BankID library being outdated)

Download the content of the private key files from 
https://git.chalmers.se/courses/dit355/2023/student-teams/dit356-2023-10/dentigo-user-service/-/settings/ci_cd under Variables.
## Usage

The service listens to the topic ```users/auth/init```. The message should be a string in the format:

```<encrypted AES key>,<encrypted payload>,<iv>```

All of these should be base64 encoded. The encrypted AES key should be encrypted with the public RSA key. The payload should be encrypted with the AES key. The iv should be the initialization vector used for the AES encryption. The payload shall be a JSON object following the format:

```json
{
    "ip": "<IP address of the client>",
    "clientID": "<Client ID to respond to>"
}
```
The initial response will be to ```clients/<clientID>/auth/init```


The service will periodically check for updates from the BankID API, and send the update to ```clients/<clientID>/auth/update```