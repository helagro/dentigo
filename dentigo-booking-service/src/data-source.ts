import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { TimeSlot } from './entity/TimeSlot'
import * as dotenv from 'dotenv'

dotenv.config()

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: true,
    logging: false,
    entities: [TimeSlot],
    migrations: [],
    subscribers: [],
})
