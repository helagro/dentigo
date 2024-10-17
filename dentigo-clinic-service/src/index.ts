/* eslint-disable prettier/prettier */
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { MqttService } from './services/mqttService';

dotenv.config();

// Initialize DB and start listening for messages
try {
    AppDataSource.initialize();
    console.log('Connected to database');
} catch (err) {
    console.log(err);
}

// Start MQTT service
const mqttService = new MqttService();
mqttService.start();