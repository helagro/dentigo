<!-- This file reference style of ClinicPopUpComponent.vue -->
<template>
    <div>
        <div v-if="showDescriptionPopUp" class="description-popup scrollable">
            <button
                class="my-btn btn btn-circle btn-primary btn-outline"
                style="right: 1em"
                @click="closePopup"
            >
                <XMarkIcon class="icon" />
            </button>
            <div>
                <div
                    id="dentists"
                    class="flex flex-col items-center justify-center py-10 text-center"
                >
                    <h2
                        class="py-3 text-4xl font-bold tracking-tight text-gray-900 sm:text-4xl"
                    >
                        Introduction
                    </h2>
                    <h2
                        class="py-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                    >
                        Dentist: {{ dentist.firstName }} {{ dentist.lastName }}
                    </h2>
                    <p class="mx-6 mt-5 text-2xl leading-8 text-gray-800">
                        {{ dentist.description }}
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, type PropType } from 'vue'
import { type Dentist } from '../entities/Dentist'
import { XMarkIcon } from '@heroicons/vue/24/solid'

export default defineComponent({
    components: {
        XMarkIcon,
    },
    props: {
        dentist: {
            type: Object as PropType<Dentist>,
            required: true,
        },
    },
    setup() {
        const showDescriptionPopUp = inject('showDescriptionPopUp', ref())
        const closePopup = () => {
            showDescriptionPopUp.value = false
        }

        return {
            showDescriptionPopUp,
            closePopup,
        }
    },
})
</script>

<style scoped>
.description-popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 50%;
    height: 40%;
    background-color: rgba(255, 255, 255, 0.98);
    /* semi-transparent background */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
    border-radius: 15px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
    /* shadow effect */
    border: 2px solid rgb(112, 4, 112);
}

/* Media Query for small screens */
@media (max-width: 768px) {
    .description-popup {
        width: 90%;
        height: 50%;
    }
}

.description-popup p {
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
