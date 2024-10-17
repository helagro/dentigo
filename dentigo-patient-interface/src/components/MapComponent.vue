<template>
    <TimeFilter />
    <GoogleMap
        class="google-map"
        :api-key="apiKey"
        :center="userLocation"
        :zoom="12"
    >
        <CustomMarker
            v-for="clinic in clinics"
            :key="clinic.id"
            :clinic="clinic"
        />
    </GoogleMap>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { GoogleMap } from 'vue3-google-map'
import Clinic from '../entities/Clinic'
import CustomMarker from './CustomMarker.vue'
import { getClinicData } from '../modules/clinic/clinics'
import TimeFilter from './TimeFilter.vue'
import { type Dentist } from '../entities/Dentist'

const GOTHENBURG_POSITION = { lat: 57.7087, lng: 11.9732 }

const apiKey = 'AIzaSyCQtAZhoTOhfx0Q4fzv8yKEzO5xveAarJM'
const userLocation = ref(GOTHENBURG_POSITION)

const notShowTimeFilter = ref(true)
provide('notShowTimeFilter', notShowTimeFilter)

const clinics = ref<Clinic[]>([])
provide('clinics', clinics)

const dentists = ref<Dentist[]>([])
provide('dentists', dentists)

const date = ref()
provide('date', date)

onMounted(async () => {
    try {
        centerMapAtUserLocation()
        clinics.value = await getClinicData()
    } catch (error) {
        console.error('Error in mounted hook:', error)
    }
})

function centerMapAtUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation.value = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                }
            },
            error => {
                console.error('Error getting user location:', error)
            },
        )
    } else {
        console.error('Geolocation is not supported by this browser.')
    }
}
</script>

<style scoped>
.google-map {
    width: 98%;
    margin: auto;
    margin-top: 10px;
    margin-bottom: 10px;
    height: 700px;
}
</style>
