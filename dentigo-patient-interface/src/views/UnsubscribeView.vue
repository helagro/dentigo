<template>
    <div>
        <p class="mt-20 text-center text-lg">{{ errorMsg }}</p>
    </div>
</template>

<script setup lang="ts">
/* ------------------------- IMPORTS ------------------------ */

import { ref } from 'vue'
import router from '@/router'
import { unsubscribeEmail } from '@/modules/notification/emailSubscription'

/* ------------------------ VARIABLES ----------------------- */

const errorMsg = ref('Unsubscribing...')

// PARAMS
const email: string | undefined =
    router.currentRoute.value.query.email?.toString()
const clinicID: string | undefined =
    router.currentRoute.value.query.clinic?.toString()

/* ------------------------ EXECUTION ----------------------- */

if (email && clinicID) {
    unsubscribeEmail(email, clinicID).then(res => {
        errorMsg.value = res.message
    })
} else {
    alert('Missing parameters')
    console.log('Missing parameters:', email, clinicID)
}
</script>
