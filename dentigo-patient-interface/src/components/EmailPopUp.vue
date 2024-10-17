<!-- This file is based on SubscribePopUp.vue -->
<!-- eslint-disable no-control-regex -->
<template>
    <div>
        <div class="my-cover" @click="$emit('toggle-visibility')" />
        <div class="my-dialog hero">
            <button
                class="my-close-btn btn btn-square btn-ghost p-2"
                @click="$emit('toggle-visibility')"
            >
                X
            </button>
            <div
                class="text-gray xs:px-4 hero-content grid grid-rows-2 py-16 sm:px-16"
            >
                <p class="gray mx-2 my-1">
                    To complete your booking, please enter your email address:
                </p>
                <div class="my-input-row">
                    <input
                        v-model="emailInput"
                        type="email"
                        placeholder="Enter your email"
                        class="input"
                        :class="{ invalid: isEmailInputBad }"
                        @keyup.enter="submitEmail"
                    />
                    <div
                        class="tooltip-bottom tooltip-error"
                        :class="{ tooltip: !isEmailValid }"
                        data-tip="Email address is invalid"
                    >
                        <button
                            class="btn btn-primary btn-outline p-2"
                            :disabled="!isEmailValid || isLoading"
                            style="font-size: 0.8rem"
                            @click="submitEmail"
                        >
                            <span
                                v-if="isLoading"
                                class="loading loading-spinner loading-sm text-primary"
                            ></span>
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
/* ------------------------- IMPORTS ------------------------ */

import { ref, computed, defineComponent } from 'vue'

/* ------------------------ VARIABLES ----------------------- */
export default defineComponent({
    emits: ['toggle-visibility', 'email-submitted'],
    setup(_, { emit }) {
        // imported from https://emailregex.com/, following the RFC 5322 standard
        const EMAIL_REGEX =
            /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/

        //REFS
        const emailInput = ref('')
        const isLoading = ref(false)

        /* ------------------- COMPUTED VARIABLES ------------------- */

        const isEmailValid = computed(() => {
            return EMAIL_REGEX.test(emailInput.value)
        })

        const isEmailInputBad = computed(() => {
            return !isEmailValid.value && emailInput.value
        })

        /* ------------------- METHODS ------------------- */

        const submitEmail = () => {
            isLoading.value = true
            emit('email-submitted', emailInput.value)
            isLoading.value = false
        }
        return {
            isEmailValid,
            isEmailInputBad,
            emailInput,
            submitEmail,
            isLoading,
        }
    },
})
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
