import { loginMenu } from './menu.js'
import * as mqttService from './services/mqttService.js'

process.on('SIGINT', async function () {
    mqttService.disconnect()
    process.exit(0)
})

mqttService.connect()

await loginMenu()
