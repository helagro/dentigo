<template>
    <main class="hero">
        <div
            class="center my-hero-content hero-content grid w-auto grid-cols-1 self-center px-10 py-10 shadow lg:px-32"
        >
            <h1 class="text-center text-2xl">Log in</h1>
            <div tabindex="0" class="bg-1 card dropdown-content shadow">
                <div class="hero">
                    <div class="hero-content flex-wrap-reverse">
                        <div class="mb-4 ms-4 grid grid-cols-1">
                            <h2 class="mb-3 text-center text-xl">
                                Instructions
                            </h2>
                            <p>
                                NOTICE: Use a
                                <a
                                    class="link"
                                    href="https://www.bankid.com/utvecklare/test/skaffa-testbankid"
                                    >test configured BankID</a
                                >
                            </p>
                            <p>1. Open the BankID app</p>
                            <p>2. Press the QR-symbol</p>
                            <p>3. Point the camera towards the QR-code</p>
                            <p>4. Follow the instructions in the app</p>
                        </div>
                        <div class="relative grid h-64 w-64">
                            <canvas
                                ref="canvas"
                                :class="{ hidden: !loaded }"
                                class="my-qr-canvas justify-self-center align-middle"
                            ></canvas>
                            <button
                                v-if="errorMsg"
                                class="my-retry-btn"
                                @click="retry"
                            >
                                <div
                                    class="my-retry-svg-container justify-self-center"
                                >
                                    <svg
                                        class="my-retry-svg"
                                        xmlns="http://www.w3.org/2000/svg"
                                        xmlns:xlink="http://www.w3.org/1999/xlink"
                                        fill="#fff"
                                        width="100%"
                                        viewBox="0 0 489.645 489.645"
                                        xml:space="preserve"
                                    >
                                        <g>
                                            <path
                                                d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3   c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5   c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8   c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2   C414.856,432.511,548.256,314.811,460.656,132.911z"
                                            />
                                        </g>
                                    </svg>
                                </div>
                            </button>
                            <span
                                v-if="!loaded"
                                class="loading loading-spinner self-center justify-self-center"
                            ></span>
                        </div>
                    </div>
                </div>
            </div>
            <ErrorDisplay class="mx-8 w-auto" :msg="errorMsg" />
            <button
                v-if="loaded"
                class="my-btn btn btn-primary px-8"
                @click="onThisDeviceClick"
            >
                Open BankID on this device
            </button>
        </div>
    </main>
</template>

<script setup lang="ts">
/* ------------------------- IMPORTS ------------------------ */

import { type Ref, ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { useUserStore } from '@/store'

// MODULES
import loginModule from '@/modules/login/index'
import Update from '@/modules/login/Update'
import router from '@/router'

/* ------------------------ PROPERTIES ----------------------- */

const userStore = useUserStore()

const canvas: Ref = ref(null)
const loaded = ref(false)
const errorMsg = ref('')
let autoStartToken: string | null = null

/* --------------------- CLICK HANDLERS -------------------- */

async function onThisDeviceClick() {
    if (!autoStartToken) {
        console.error('Error in onThisDeviceClick: autoStartToken is null')
        errorMsg.value = 'Failed to open BankID on this device'
        return
    }

    const launchUrl = `https://app.bankid.com/?autostarttoken=${autoStartToken}&redirect=null` //&redirect=${THIS_PATH}}`
    window.open(launchUrl, '_blank')
}

/* --------------------- LOGIN LIFECYCLE -------------------- */

onMounted(initAuth)

function retry() {
    errorMsg.value = ''
    initAuth()
}

async function initAuth() {
    try {
        const res = await loginModule.initAuth()

        if (!res) {
            console.error('Error in initAuth: res is null')
            errorMsg.value = 'Could not reach server, please try again later'
            return
        }

        autoStartToken = res.autoStartToken
        onUpdate(new Update(res.status, res.qr, res.errorMsg, null))

        if (res.status == 'pending') collectUpdates()
    } catch (err) {
        errorMsg.value = err as string
    }
}

function collectUpdates() {
    loginModule.collectUpdates(onUpdate)
}

function onUpdate(update: Update | null) {
    if (!update) {
        console.error('Error in onUpdate: update is null')
        errorMsg.value = 'Could not reach server, please try again later'
        return
    }

    switch (update.status) {
        case 'pending':
            break
        case 'failed':
            errorMsg.value = 'Authentication failed, press the QR-code to retry'
            break
        case 'complete':
            sessionStorage.setItem('user', JSON.stringify(update.user))
            userStore.$patch({ user: update.user })
            router.push('/')
            break
        default:
            errorMsg.value = 'Unknown error'
            console.error(
                `Error in onUpdate: unknown status value ${update.status}`,
            )
            break
    }

    if (update.qr) drawQR(update.qr)
}

/* --------------------- HELPERS --------------------- */

function drawQR(qrStr: string) {
    QRCode.toCanvas(
        canvas.value,
        qrStr,
        { scale: 4.7 },
        function (error: object) {
            if (error) {
                errorMsg.value = 'Failed to draw QR code'
                console.error(error)
            }
        },
    )
    loaded.value = true
}
</script>

<style scoped>
.my-hero-content {
    margin-top: max(2vh, 0.4em);
}

.my-qr-canvas {
    align-self: center;
}

.my-retry-btn {
    position: absolute;
    height: 100%;
    z-index: 1;
    width: 100%;
    background-color: #fff7;
    backdrop-filter: blur(0.01em);
    display: grid;
}

.my-retry-svg-container {
    backdrop-filter: blur(10em);
    width: 22%;
    padding: 1em;
    border-radius: 50%;
    background-color: rgba(35, 35, 35, 0.85);
    align-self: center;
}

.my-btn {
    text-transform: none;
    width: fit-content;
    margin: 1em auto;
}
</style>
