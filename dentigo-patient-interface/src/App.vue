<template>
    <NavBar />
    <RouterView />
</template>

<script setup lang="ts">
/* ------------------------- IMPORTS ------------------------ */

// COMPONENTS
import NavBar from './components/NavBar.vue'
import { RouterView } from 'vue-router'

// USER
import { useUserStore } from './store'
import User from '@/modules/login/User'

// CLEAN UP
import { onBeforeUnmount } from 'vue'
import { disconnect } from '@/modules/mqtt'

/* ----------------------- USER STORE ----------------------- */

const userStore = useUserStore()
const userStr = sessionStorage.getItem('user')
const user: User | null = userStr ? (JSON.parse(userStr) as User) : null
userStore.$patch({ user: user })

/* ------------------------ CLEAN UP ------------------------ */

onBeforeUnmount(() => {
    disconnect()
})
</script>
