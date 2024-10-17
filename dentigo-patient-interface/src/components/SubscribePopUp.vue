<!-- eslint-disable no-control-regex -->
<template>
    <div>
        <div class="my-cover" @click="$emit('toggle-visibility')" />
        <div class="my-dialog hero">
            <button
                class="my-close-btn btn btn-square btn-ghost p-2"
                @click="$emit('toggle-visibility')"
            >
                <XMarkIcon class="icon" />
            </button>
            <div
                class="text-gray xs:px-4 hero-content grid grid-rows-2 py-16 sm:px-16"
            >
                <p class="gray mx-2 my-1">
                    Enter your email address to be notified when new times are
                    available for this clinic.
                </p>
                <div class="my-input-row">
                    <input
                        v-model="emailInput"
                        type="email"
                        placeholder="Enter your email"
                        class="input"
                        :disabled="isSuccess"
                        :class="{ invalid: isEmailInputBad }"
                        @keyup.enter="submitEmail"
                    />
                    <div
                        class="tooltip-bottom tooltip-error"
                        :class="{ tooltip: !isEmailValid }"
                        data-tip="Email address is invalid"
                    >
                        <CheckIcon
                            v-if="isSuccess"
                            class="icon my-icon btn-success"
                        />
                        <button
                            v-else
                            class="btn btn-square btn-primary btn-outline p-2"
                            :disabled="!isEmailValid || isLoading"
                            @click="submitEmail"
                        >
                            <span
                                v-if="isLoading"
                                class="loading loading-spinner loading-sm text-primary"
                            ></span>
                            <BellIcon v-else class="icon" />
                        </button>
                    </div>
                </div>
                <ErrorDisplay :msg="errorMessage" @clear="clearError" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/* ------------------------- IMPORTS ------------------------ */

import { ref, computed } from 'vue'
import ErrorDisplay from './ErrorDisplay.vue'
import { subscribeEmail } from '../modules/notification/emailSubscription'
import Clinic from '@/entities/Clinic'
import { ResponseMQTT } from '@/modules/mqtt'

// ICONS
import { XMarkIcon } from '@heroicons/vue/24/solid'
import { BellIcon } from '@heroicons/vue/24/outline'
import { CheckIcon } from '@heroicons/vue/24/solid'

/* ------------------------ VARIABLES ----------------------- */

// imported from https://emailregex.com/, following the RFC 5322 standard
const EMAIL_REGEX =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

//REFS
const emailInput = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const isSuccess = ref(false)

/* ------------------- EMITS & PROPS ------------------- */

defineEmits(['toggle-visibility'])
const props = defineProps({
    clinic: {
        type: Clinic,
        required: true,
    },
})

/* ------------------- COMPUTED VARIABLES ------------------- */

const isEmailValid = computed(() => {
    return EMAIL_REGEX.test(emailInput.value)
})

const isEmailInputBad = computed(() => {
    return !isEmailValid.value && emailInput.value
})

/* ------------------- METHODS ------------------- */

function clearError() {
    errorMessage.value = ''
}

async function submitEmail() {
    isLoading.value = true

    const response: ResponseMQTT = await subscribeEmail(
        emailInput.value,
        props.clinic,
    )
    if (response.isSuccess()) {
        isSuccess.value = true
    } else {
        errorMessage.value = response.message
    }

    isLoading.value = false
}
</script>

<style scoped>
.my-cover {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    border-radius: 15px;
    height: 100%;
    background-color: rgba(107, 107, 107, 0.5);
    backdrop-filter: blur(2px);
}

.my-dialog {
    position: fixed;
    top: 40%;
    left: 50%;
    right: 50%;
    transform: translate(-50%, -50%);
    max-width: 30em;
    z-index: 11;
    border-radius: 1em;
    margin: 0;
    background-color: #fff;
}

.my-close-btn {
    position: absolute;
    top: 0.5em;
    right: 0.5em;
    z-index: 12;
}

.my-input-row {
    display: grid;
    grid-template-columns: 1fr auto;
    column-gap: 1em;
}

.invalid {
    border: 1px solid red;
}

.my-icon {
    width: 3em;
    height: 3em;
    padding: 0.6em;
    border-radius: 9999px;
}
</style>
