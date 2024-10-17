<template>
    <div class="text-center">
        <div v-if="notification" class="notificationToast">
            {{ notification.message }}
        </div>
        <button
            class="text-purple-1200 btn btn-xs bg-white sm:btn-sm"
            @click="$emit('mark-as-read')"
        >
            Mark as read
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    props: {
        notification: {
            type: Object,
            required: true,
        },
    },
    emits: ['mark-as-read'],
    setup(props) {
        const notificationRef = ref(props.notification)
        return {
            ...props,
            notificationRef,
        }
    },
})
</script>

<style scoped>
.btn {
    margin-top: 1%;
    font-size: 0.6rem;
}
@media (max-width: 430px) {
    .btn {
        margin-top: 1%;
        font-size: 0.5rem;
        padding: 5%;
    }
}
</style>
