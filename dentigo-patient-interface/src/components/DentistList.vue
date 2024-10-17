<template>
    <div class="bg-white py-8 sm:py-12">
        <div class="max-w-8xl mx-auto px-6 lg:px-8">
            <div
                id="dentists"
                class="flex flex-col items-center justify-center py-10 text-center"
            >
                <h2
                    class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
                >
                    List of dentists
                </h2>
                <p class="mt-2 text-lg leading-8 text-gray-600">
                    Choose the dentist that's right for you.
                </p>
            </div>

            <TimeFilter v-if="!notShowTimeFilter" />

            <div class="max-w-8xl mx-auto ml-2 mr-2">
                <ul role="list" class="divide-y divide-gray-100">
                    <DentistCard
                        v-for="dentist in paginatedDentists"
                        :key="dentist.id"
                        :dentist="dentist"
                    />
                </ul>
            </div>

            <div v-if="noDentistsShow" role="alert" class="alert">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="h-6 w-6 shrink-0 stroke-info"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <span>There is no dentist available.</span>
            </div>

            <div class="mt-4 flex justify-center">
                <button
                    :disabled="currentPage === 1"
                    class="mx-1 rounded-md border border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
                    @click="previousPage"
                >
                    Previous
                </button>
                <span class="mx-2 py-3 font-bold text-gray-700">
                    Page {{ currentPage }} of {{ totalPages }}
                </span>
                <button
                    :disabled="currentPage === totalPages"
                    class="mx-1 rounded-md border border-gray-300 bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
                    @click="nextPage"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import DentistCard from './DentistCard.vue'
import {
    computed,
    defineComponent,
    inject,
    onBeforeUnmount,
    onMounted,
    provide,
    ref,
} from 'vue'
import * as mqttModule from '../modules/mqtt'
import * as filterModule from '../modules/filter/filterUtils'
import { type Dentist } from '../entities/Dentist'
import { type TimeSlot } from '../entities/TimeSlot'
import TimeFilter from './TimeFilter.vue'
import Clinic from '../entities/Clinic'

export default defineComponent({
    components: {
        TimeFilter,
        DentistCard,
    },

    setup() {
        const dentists = inject('dentists', ref<Dentist[]>([]))
        provide('dentists', dentists)
        const timeSlots = ref<TimeSlot[]>([])
        const clinic = inject<Clinic>('clinic')
        let date = inject('date', ref())

        const notShowTimeFilter = inject('notShowTimeFilter', ref())
        const noDentistsShow = ref(false)
        provide('noDentistsShow', noDentistsShow)

        if (date === undefined) {
            date = ref()
        }
        provide('date', date)

        //======================Get dentists====================//
        const retrieveDentists = async () => {
            if (date.value === undefined || date.value === null) {
                dentists.value = (await filterModule.getDentists('all')) || []
            } else {
                dentists.value =
                    (await filterModule.getFilteredDentists(
                        date.value[0],
                        date.value[1],
                    )) || []
            }
            if (clinic) {
                dentists.value =
                    (await filterModule.filterDentistsByClinic(
                        dentists.value,
                        clinic,
                    )) || []
            }
        }

        //=========================Listen when dentists are updated================//
        const listenDentistsUpdated = () => {
            const listenTopic = 'clients/dentists/isUpdated'
            const topicsToSubscribe = [listenTopic]
            const qos = 2

            const callback = async (topic: string, message: string) => {
                const isUpdated = JSON.parse(message).isUpdated
                if (isUpdated) {
                    await retrieveDentists()
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

        //======================Pagination====================//
        const currentPage = ref(1)
        const itemsPerPage = 3 // dentists number of page

        const paginatedDentists = computed(() => {
            if (dentists.value.length > 0) {
                const startIndex = (currentPage.value - 1) * itemsPerPage
                const endIndex = startIndex + itemsPerPage
                return dentists.value.slice(startIndex, endIndex)
            } else {
                return []
            }
        })

        const totalPages = computed(() =>
            Math.max(1, Math.ceil(dentists.value.length / itemsPerPage)),
        )

        const previousPage = () => {
            if (currentPage.value > 1) {
                currentPage.value--
            }
        }

        const nextPage = () => {
            if (currentPage.value < totalPages.value) {
                currentPage.value++
            }
        }

        onMounted(() => {
            try {
                retrieveDentists()
                listenDentistsUpdated()
            } catch (error) {
                console.error(`Error during MQTT operations: ${error}`)
            }
        })

        onBeforeUnmount(() => {
            try {
                mqttModule.unRegisterEvent('clinic/dentists/get/all/response')
                mqttModule.unsubscribe('clinic/dentists/get/all/response')
                mqttModule.unRegisterEvent('clinic/dentists/get/response')
                mqttModule.unsubscribe('clinic/dentists/get/response')
                mqttModule.unRegisterEvent(
                    'clients/PatientUI/booking/timeslot/get',
                )
                mqttModule.unsubscribe('clients/PatientUI/booking/timeslot/get')
                mqttModule.unsubscribe('clients/dentists/isUpdated')
            } catch (error) {
                console.error(`Error during unsubscription: ${error}`)
            }
        })

        return {
            dentists,
            timeSlots,
            paginatedDentists,
            currentPage,
            totalPages,
            notShowTimeFilter,
            noDentistsShow,
            retrieveDentists,
            listenDentistsUpdated,
            previousPage,
            nextPage,
        }
    },
})
</script>
