<template>
    <div class="ml-4 mt-4 flex flex-col gap-x-1 sm:flex-row">
        <p class="text-1xl font-bold" style="width: 22vh; line-height: 4vh">
            Search by time period:
        </p>
        <VueDatePicker
            v-model="date"
            range
            class="justify-self-start"
            style="width: 40vh"
        />
        <button
            class="btn btn-circle btn-ghost ml-4"
            @click="filterByDatePeriod"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
            </svg>
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, inject } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { type Dentist } from '../entities/Dentist'
import Clinic from '../entities/Clinic'
import {
    getFilteredDentists,
    getFilteredClinics,
    getDentists,
    getClinics,
} from '../modules/filter/filterUtils'

export default defineComponent({
    components: {
        VueDatePicker,
    },

    setup() {
        const date = ref()
        const dateRef = inject('date', ref())

        const dentists = inject('dentists', ref<Dentist[]>([]))
        const clinics = inject('clinics', ref<Clinic[]>([]))
        const noDentistsShow = inject('noDentistsShow', ref())

        const filterByDatePeriod = async () => {
            dateRef.value = date.value
            const currentDate = new Date()

            if (date.value === null) {
                dentists.value = (await getDentists('all')) || []
                clinics.value = (await getClinics('all')) || []
                if (dentists.value.length === 0) {
                    noDentistsShow.value = true
                } else {
                    noDentistsShow.value = false
                }
            } else {
                if (date.value[0] >= currentDate) {
                    dentists.value =
                        (await getFilteredDentists(
                            date.value[0],
                            date.value[1],
                        )) || []
                    if (dentists.value.length === 0) {
                        noDentistsShow.value = true
                    } else {
                        noDentistsShow.value = false
                    }
                    clinics.value =
                        (await getFilteredClinics(
                            date.value[0],
                            date.value[1],
                        )) || []
                } else {
                    alert('Please select a time period after the current time.')
                }
            }
        }

        onMounted(() => {
            const startDate = new Date()
            const endDate = new Date(
                new Date().setDate(startDate.getDate() + 7),
            )
            date.value = [startDate, endDate]
        })

        return {
            filterByDatePeriod,
            date,
            dentists,
        }
    },
})
</script>
