import * as mqttService from './services/mqttService.js'
import pollingService from './services/pollingService.js'

process.on('SIGINT', async function () {
    mqttService.disconnect()
    process.exit(0)
})

mqttService.connect()

pollingService()
