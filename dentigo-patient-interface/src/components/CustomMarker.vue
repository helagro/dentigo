<template>
    <Marker
        :options="{
            position: clinic.getPosition(),
            icon: {
                url: hasSlots() ? GREEN_MARKER : RED_MARKER,
                scaledSize: {
                    width: 40,
                    height: 40,
                },
            },
        }"
        @click="showPopup = true"
    >
        <MapPopup
            v-if="showPopup"
            :clinic="clinic"
            :is-visible="showPopup"
            @close-popup="closePopup"
        />
    </Marker>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Marker } from 'vue3-google-map'
import Clinic from '../entities/Clinic'
import MapPopup from '../components/ClinicPopUpComponent.vue'

const GREEN_MARKER =
    'https://maps.google.com/mapfiles/kml/paddle/grn-circle.png'
const RED_MARKER = 'https://maps.google.com/mapfiles/kml/paddle/red-circle.png'

defineProps({
    clinic: {
        type: Clinic,
        required: true,
    },
})

const showPopup = ref(false)

function hasSlots() {
    return true
}

function closePopup() {
    showPopup.value = false
}
</script>

<style scoped></style>
