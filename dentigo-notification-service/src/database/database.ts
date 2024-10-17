import { DataSource } from 'typeorm'
import { Notification } from '../entities/Notification'
import { ClinicNotificationSubscription } from '../entities/ClinicNotificationSubscription'

export async function createDatabaseConnection() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
        username: process.env.POSTGRES_USERNAME,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DATABASE,
        entities: [Notification, ClinicNotificationSubscription],
        synchronize: true,
    })
    try {
        await dataSource.initialize()
        console.log('Connected to Postgres')
    } catch (error) {
        console.error(error)
        throw new Error('Unable to connect to Postgres')
    }
}
