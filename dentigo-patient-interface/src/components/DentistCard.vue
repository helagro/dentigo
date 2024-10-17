<template>
    <li class="flex flex-col justify-between gap-x-6 py-8 sm:flex-row">
        <div class="flex min-w-0 gap-x-4 py-1" style="width: 23vh">
            <img
                class="h-12 w-12 flex-none rounded-full bg-gray-50"
                :src="
                    dentist.image ||
                    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                "
                alt=""
            />
            <div class="min-w-0 flex-auto">
                <p class="text-sm font-semibold leading-6 text-gray-900">
                    {{ dentist.firstName }} {{ dentist.lastName }}
                </p>
                <p class="mt-1 truncate text-xs leading-5 text-gray-500">
                    {{ dentist.email }}
                </p>
            </div>
        </div>
        <div
            tabindex="0"
            class="btn m-1"
            style="width: 23vh"
            @click="showDescriptionPopUp = true"
        >
            Introduction
        </div>
        <div class="dropdown" style="width: 24vh" @click="showTimeSlots">
            <div
                tabindex="0"
                role="button"
                class="btn m-1"
                :class="{
                    'text-black': defaultTimeSlot == 'Select Time Slots',
                    'text-green-500':
                        defaultTimeSlot != 'Select Time Slots' &&
                        (!selectedTimeSlot?.patientID ||
                            selectedTimeSlot?.patientID.includes('CANCELLED')),
                    'text-purple-600':
                        patientID != undefined &&
                        selectedTimeSlot?.patientID == patientID,
                    'text-gray-400':
                        selectedTimeSlot?.patientID &&
                        selectedTimeSlot?.patientID != patientID,
                }"
            >
                {{ defaultTimeSlot }}
            </div>
            <ul
                tabindex="0"
                class="menu dropdown-content rounded-box z-[1] w-52 bg-base-100 p-2 shadow"
                style="max-height: 300px; overflow-x: auto"
            >
                <li
                    v-for="timeSlot in timeSlots"
                    :key="timeSlot.id"
                    style="width: 24vh"
                >
                    <a
                        v-if="timeSlot"
                        :class="{
                            'text-green-500':
                                !timeSlot.patientID ||
                                timeSlot?.patientID.includes('CANCELLED'),
                            'text-purple-600':
                                patientID != undefined &&
                                timeSlot.patientID == patientID,
                            'text-gray-400':
                                timeSlot.patientID &&
                                timeSlot.patientID != patientID,
                        }"
                        @click="selecteTimeSlot(timeSlot)"
                        >{{ timeSlot.timeSlotStart }} -
                        <br />
                        {{ timeSlot.timeSlotEnd }} -</a
                    >
                </li>
            </ul>
        </div>
        <div class="py-1">
            <button
                v-if="
                    !isBooked &&
                    (!selectedTimeSlot?.patientID ||
                        selectedTimeSlot?.patientID.includes('CANCELLED'))
                "
                class="btn btn-primary btn-outline"
                style="width: 12vh"
                @click="bookTimeSlot"
            >
                Book
            </button>
            <!-- Check if selected timeSlot is booked by the logged-in patient
                by checking if the timeSlot.patientID is the same as the login patient ID (userID)
                if yes, 'Cancel Booking' button is shown to the logged-in patient,
                that allows the patient to cancel the timeslot 
            -->
            <button
                v-if="
                    isBooked ||
                    (patientID != undefined &&
                        selectedTimeSlot?.patientID === patientID)
                "
                class="btn btn-primary"
                style="width: 12vh"
                @click="unbookTimeSlot"
            >
                Cancel
            </button>
            <button
                v-if="
                    selectedTimeSlot?.patientID &&
                    selectedTimeSlot?.patientID != patientID &&
                    !selectedTimeSlot?.patientID.includes('CANCELLED')
                "
                class="btn btn-ghost btn-active"
                style="width: 12vh"
            >
                Unable
            </button>
            <EmailPopUp
                v-if="showEmailPopUp"
                @toggle-visibility="toggleEmailPopUp"
                @email-submitted="updateBookingEmail"
            >
            </EmailPopUp>
        </div>
    </li>
    <DescriptionPopUp v-if="showDescriptionPopUp" :dentist="dentist" />
</template>

<script lang="ts">
import {
    defineComponent,
    inject,
    onBeforeUnmount,
    provide,
    ref,
    type PropType,
} from 'vue'
import { type Dentist } from '../entities/Dentist'
import { type TimeSlot } from '../entities/TimeSlot'
import * as mqttModule from '../modules/mqtt'
import * as filterModule from '../modules/filter/filterUtils'
import { useUserStore } from '../store'
import EmailPopUp from './EmailPopUp.vue'
import DescriptionPopUp from './DescriptionPopUp.vue'
import { downloadPublicKey, encrypt } from '@/modules/encryption2'

export default defineComponent({
    components: {
        EmailPopUp,
        DescriptionPopUp,
    },
    props: {
        dentist: {
            type: Object as PropType<Dentist>,
            required: true,
        },
    },

    setup(props) {
        const dentist = props.dentist
        const timeSlots = ref<TimeSlot[]>([])
        const date = inject('date', ref())

        const userStore = useUserStore()
        const patientID = userStore.user?.id
        const bookingMessage = {
            dentistID: dentist.id,
            patientID: patientID,
            email: '',
            timeSlotID: '',
        }

        const showEmailPopUp = ref(false)

        //Select time slot
        const defaultTimeSlot = ref('Select Time Slots')
        const selectedTimeSlot = ref<TimeSlot>()
        const selecteTimeSlot = (timeSlot: TimeSlot) => {
            selectedTimeSlot.value = timeSlot
            defaultTimeSlot.value =
                timeSlot.timeSlotStart + ' - ' + timeSlot.timeSlotEnd + ' - '
            bookingMessage.timeSlotID = timeSlot.id
            isBooked.value = false
        }

        //Click event of Book button
        const isBooked = ref(false)
        const bookTimeSlot = () => {
            if (selectedTimeSlot.value !== undefined) {
                if (patientID !== undefined) {
                    // Bookings can only be made
                    // once the patient has entered their email address in the pop-up email entry window
                    // and clicked the Confirm Booking button.
                    toggleEmailPopUp()
                } else {
                    alert('Please log in first!')
                }
            } else {
                alert('Please select a time slot!')
            }
        }
        const unbookTimeSlot = () => {
            if (selectedTimeSlot.value !== undefined) {
                publishBookingMessage('cancelBooking')
                isBooked.value = false
            } else {
                alert('Please select a time slot!')
            }
        }
        //publish message to Booking Service by MQTT
        const publishBookingMessage = async (bookingStatus: string) => {
            // creates booking message
            const bookingMessageJson = JSON.stringify({
                ...bookingMessage,
                clientID: mqttModule.getID(),
                signature: userStore.user?.signature,
            })

            // encrypts booking message
            const publicKey = await downloadPublicKey('bookingServiceEncrypt')
            const encrypted = await encrypt(bookingMessageJson, publicKey)

            // defines publish callback
            const callback = () => {
                console.log(
                    'Message of sendBookingMessage published successfully',
                )
            }

            // calculates publish topic
            const pubTopic =
                bookingStatus === 'cancelBooking'
                    ? 'booking/timeslot/unbook'
                    : 'booking/timeslot/book'

            // publishes booking message
            console.log('publishing booking message', encrypted)
            mqttModule.publish(pubTopic, encrypted, 2, undefined, callback)
        }
        /* ------------------ Helpers for Email entry pop-up window ----------------- */
        const toggleEmailPopUp = () => {
            showEmailPopUp.value = !showEmailPopUp.value
        }
        const updateBookingEmail = (submittedEmail: string) => {
            bookingMessage.email = submittedEmail
            confirmBooking()
        }
        const confirmBooking = () => {
            publishBookingMessage('booking')
            isBooked.value = true
            toggleEmailPopUp()
        }

        //===================== Helpers for show description pop up=====================/
        const showDescriptionPopUp = ref(false)
        provide('showDescriptionPopUp', showDescriptionPopUp)

        //=========================Get time slots================//
        let timeSlotsListenerInitialized = false
        const showTimeSlots = async () => {
            retrieveTimeSlots()
            if (!timeSlotsListenerInitialized) {
                listenTimeSlotsUpdated()
                timeSlotsListenerInitialized = true
            }
        }
        const retrieveTimeSlots = async () => {
            timeSlots.value =
                (await filterModule.getTimeSlots(dentist.id)) || []
            if (date.value != null) {
                timeSlots.value =
                    filterModule.getFilteredTimeSlots(
                        timeSlots.value,
                        date.value[0],
                        date.value[1],
                    ) || []
            }
            if (timeSlots.value.length === 0) {
                alert(
                    `Dentist ${dentist.firstName} ${dentist.lastName} doesn't have a time slot.`,
                )
            }
        }

        //=========================Listen when time slots are updated================//
        const listenTimeSlotsUpdated = () => {
            const listenTopic = 'clients/timeslot/isUpdated'
            const topicsToSubscribe = [listenTopic]
            const qos = 2

            const callback = async (topic: string, message: string) => {
                const isUpdated = JSON.parse(message).isUpdated
                if (isUpdated) {
                    await retrieveTimeSlots()
                    if (selectedTimeSlot.value !== undefined) {
                        let isMatch = false
                        for (const timeSlot of timeSlots.value) {
                            if (selectedTimeSlot.value.id === timeSlot.id) {
                                selectedTimeSlot.value = timeSlot
                                isMatch = true
                                break
                            }
                        }
                        if (!isMatch) {
                            selectedTimeSlot.value = undefined
                            defaultTimeSlot.value = 'Select Time Slots'
                            isBooked.value = false
                        }
                    }
                }
            }
            mqttModule.subscribe(topicsToSubscribe, qos, undefined, err => {
                if (err) {
                    console.error(`Subscription error: ${err}`)
                } else {
                    mqttModule.registerEvent(listenTopic, callback)
                }
            })
        }

        onBeforeUnmount(() => {
            try {
                mqttModule.unRegisterEvent(
                    'clients/PatientUI/booking/timeslot/get',
                )
                mqttModule.unsubscribe('clients/PatientUI/booking/timeslot/get')
                mqttModule.unsubscribe('clients/timeslot/isUpdated')
            } catch (error) {
                console.error(`Error during unsubscription: ${error}`)
            }
        })

        return {
            patientID,
            timeSlots,
            defaultTimeSlot,
            selectedTimeSlot,
            isBooked,
            showEmailPopUp,
            showDescriptionPopUp,
            selecteTimeSlot,
            publishBookingMessage,
            bookTimeSlot,
            showTimeSlots,
            retrieveTimeSlots,
            unbookTimeSlot,
            toggleEmailPopUp,
            updateBookingEmail,
            listenTimeSlotsUpdated,
        }
    },
})
</script>
