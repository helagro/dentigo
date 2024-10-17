export default class User {
    socials: string // Don't use me to identify users, use id instead
    fName: string
    lName: string
    id: string
    signature: string

    constructor(
        socials: string,
        fName: string,
        lName: string,
        id: string,
        signature: string,
    ) {
        this.socials = socials
        this.fName = fName
        this.lName = lName
        this.id = id
        this.signature = signature
    }

    getID() {
        return this.id
    }
}
