import { defineStore } from 'pinia'
import User from './modules/login/User'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as User | null,
    }),
})
