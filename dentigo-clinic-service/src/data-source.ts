import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'
import { Dentist } from './entities/Dentist'
import { Clinic } from './entities/Clinic'

dotenv.config()

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: true,
    logging: process.env.LOGGING === 'true',
    entities: [Dentist, Clinic],
    migrations: [],
    subscribers: [],
})
