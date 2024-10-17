<template>
    <div>
        <div class="my-cover" @click="closePopup" />
        <div v-if="isVisible" class="map-popup">
            <button
                class="my-btn btn btn-circle btn-primary btn-outline"
                style="left: 1em"
                @click="toggleSubscribePopUp"
            >
                <BellIcon class="icon" />
            </button>

            <button
                class="my-btn btn btn-circle btn-primary btn-outline"
                style="right: 1em"
                @click="closePopup"
            >
                <XMarkIcon class="icon" />
            </button>

            <SubscribePopUp
                v-if="showSubscribePopUp"
                :clinic="clinic"
                @toggle-visibility="toggleSubscribePopUp"
            />
            <div class="scrollable">
                <DentistList />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { type Ref, ref, provide } from 'vue'
import Clinic from '@/entities/Clinic'

// ICONS
import { BellIcon } from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/24/solid'

// COMPONENTS
import SubscribePopUp from '@/components/SubscribePopUp.vue'
import DentistList from './DentistList.vue'

const showSubscribePopUp: Ref = ref(false)

const props = defineProps({
    clinic: {
        type: Clinic,
        required: true,
    },
    onClosePopup: {
        type: Function, // Adjust this type based on the actual type of onClosePopup
        required: true,
    },
})

const isVisible = ref(true)

provide('clinic', props.clinic)

function toggleSubscribePopUp() {
    showSubscribePopUp.value = !showSubscribePopUp.value
}

const closePopup = () => {
    isVisible.value = false
    props.onClosePopup(false)
}
</script>

<style scoped>
.my-cover {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    background-color: rgba(107, 107, 107, 0.5);
    backdrop-filter: blur(2px);
}
.map-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 95%;
    height: 95%;
    background-color: rgba(
        255,
        255,
        255,
        0.9
    ); /* semi-transparent background */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
    border-radius: 15px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1); /* shadow effect */
}

.map-popup p {
    margin-bottom: 20px;
}
.my-btn {
    position: absolute;
    top: 1em;
    width: 2.7em;
    height: 2.7em;
    border: none;
}

.scrollable {
    overflow: auto;
    max-height: 80%;
}
</style>
