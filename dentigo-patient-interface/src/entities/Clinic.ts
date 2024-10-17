import { type Dentist } from './Dentist'

export default class Clinic {
    id: string
    email: string
    name: string
    latitude: number
    longitude: number
    address: string
    dentists: Dentist[]

    constructor(
        id: string,
        latitude: number,
        longitude: number,
        name: string,
        email: string,
        address: string,
    ) {
        this.id = id
        this.latitude = latitude
        this.longitude = longitude
        this.name = name
        this.email = email
        this.address = address
        this.dentists = []
    }

    getPosition() {
        return { lat: this.latitude, lng: this.longitude }
    }
}
