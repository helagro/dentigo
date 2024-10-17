<template>
    <nav class="bg-gray-800">
        <div class="max-w-8xl mx-auto px-2 sm:px-6 lg:px-8">
            <div class="relative flex h-16 items-center justify-between">
                <div
                    class="absolute inset-y-0 left-0 flex items-center sm:hidden"
                >
                    <!-- Mobile menu button-->
                    <button
                        type="button"
                        class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        aria-controls="mobile-menu"
                        aria-expanded="false"
                        @click="toggleMobileMenu"
                    >
                        <span class="absolute -inset-0.5"></span>
                        <span class="sr-only">Open main menu</span>
                        <!-- Icon when menu is closed. Menu open: "hidden", Menu closed: "block" -->
                        <svg
                            class="block h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                            />
                        </svg>
                        <!-- Icon when menu is open. Menu open: "block", Menu closed: "hidden" -->
                        <svg
                            class="hidden h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
                <div
                    class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"
                >
                    <div class="flex flex-shrink-0 items-center">
                        <svg
                            t="1704655482104"
                            class="icon h-8 w-auto"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="35765"
                        >
                            <path
                                d="M157.910326 72.704C265.120744-9.811349 402.384372 0.928744 511.952372 90.731163l6.167814 5.167628c1.428837 1.14307 5.00093 3.691163 10.47814 7.144186 9.597023 6.048744 20.884837 12.145116 33.720558 17.884279 23.766326 10.597209 49.890233 18.574884 78.085953 22.885209a29.767442 29.767442 0 1 1-8.97786 58.868093 363.234233 363.234233 0 0 1-93.350698-27.386046c-26.814512-11.930791-46.103814-24.123535-57.844093-33.482419-91.064558-77.847814-200.46586-87.778233-286.005581-21.932651C108.186791 186.153674 87.992558 310.367256 146.217674 405.551628l6.929861 10.954419 3.238698 5.239069c4.953302 8.168186 10.454326 17.598512 16.336372 28.171907a1127.114419 1127.114419 0 0 1 49.294883 99.780465c39.531163 91.112186 65.393116 182.962605 71.108465 273.312745l0.11907 3.73879c0.23814 3.738791 0.762047 9.025488 1.833675 15.336186 2.452837 14.621767 6.858419 29.172093 13.645395 42.460279 11.549767 22.694698 28.672 39.602605 53.176558 49.413954l5.786791 2.143256 3.024372 1.190697 3.810233 1.690791c1.571721 0.642977 3.405395 1.381209 5.405767 2.143256l3.095814 1.119256c3.881674 1.357395 7.549023 2.452837 10.811535 3.238697 3.85786 0.90493 6.667907 1.190698 7.239442 1.14307 6.620279-0.809674 12.811907-31.267721 11.264-127.88093l-0.571535-26.338233a510.904558 510.904558 0 0 1 7.001302-96.208372c12.549953-71.346605 40.650419-118.045767 95.493954-118.045767s82.967814 46.675349 95.493953 118.021953c5.23907 29.81507 7.144186 60.249302 7.096558 86.539907l-0.190511 12.788093-0.333396 15.550512c-2.000372 102.757209 4.33414 134.739349 11.073489 135.572837 0.619163 0.071442 3.405395-0.23814 7.263255-1.14307 3.286326-0.762047 6.953674-1.905116 10.811535-3.238697 3.238698-1.14307 6.167814-2.28614 8.501582-3.262512l3.810232-1.666977 3.048186-1.214511c27.624186-9.406512 46.532465-27.100279 58.963349-51.55721 6.786977-13.312 11.192558-27.862326 13.669209-42.484093l1.024-7.04893c0.547721-4.310326 0.809674-7.858605 0.881117-10.406698l0.095256-3.762604c5.643907-88.206884 31.529674-180.057302 71.060837-271.169489a1126.876279 1126.876279 0 0 1 49.294883-99.756651l6.858419-12.145116 3.286326-5.643907 9.430325-15.645767 3.286326-5.23907c62.678326-95.779721 43.436651-223.708279-44.389209-291.363721-66.274233-51.033302-146.455814-56.962977-223.208187-19.622698a29.767442 29.767442 0 0 1-26.028651-53.533767C681.555349-0.23814 785.908093 7.477581 870.614326 72.704c110.901581 85.420651 136.453953 244.021581 62.011534 364.66307l-8.049116 12.788093-1.524093 2.500465c-4.596093 7.525209-9.716093 16.336372-15.24093 26.266791a1067.674791 1067.674791 0 0 0-46.675349 94.446139c-34.958884 80.586419-58.391814 161.339535-65.178791 235.996279l-1.024 13.097675c0.11907 23.766326-5.334326 56.20093-22.075534 89.088-18.098605 35.530419-46.341953 63.011721-85.777861 78.347907l-5.262884 1.881302-1.476465 0.690605a203.371163 203.371163 0 0 1-10.763907 4.357953l-4.357953 1.571721c-5.715349 2.024186-11.38307 3.738791-16.907907 5.024744-10.049488 2.381395-19.241674 3.357767-28.100465 2.28614-56.677209-6.906047-66.67907-54.533953-63.249861-203.514047l0.261954-11.002046a481.04186 481.04186 0 0 0-0.523907-32.386977 424.436093 424.436093 0 0 0-5.572465-52.319256c-7.977674-45.437023-22.051721-68.822326-36.864-68.822325s-28.862512 23.385302-36.864 68.822325c-2.881488 16.431628-4.691349 34.220651-5.572466 52.34307-0.476279 10.049488-0.642977 19.146419-0.595348 26.862139l0.66679 33.220466c2.28614 135.763349-9.049302 180.128744-63.630883 186.796651-8.811163 1.071628-18.027163 0.095256-28.124279-2.28614a166.769116 166.769116 0 0 1-16.836466-5.00093 221.469767 221.469767 0 0 1-11.954604-4.596093l-4.524651-2.000372-5.381954-1.92893c-37.125953-14.431256-64.345302-39.626419-82.491535-72.156279l-3.286325-6.191628c-15.550512-30.529488-21.337302-60.677953-22.004093-83.729861l-0.047628-3.619721-1.000186-13.002418c-6.429767-71.989581-27.552744-147.741767-59.177675-223.58921l-6.048744-14.21693a1067.960558 1067.960558 0 0 0-46.651535-94.469953l-6.429767-11.359256a797.505488 797.505488 0 0 0-6.001117-10.24l-8.287255-13.454884C20.575256 322.417116 45.056 159.62493 157.910326 72.704z"
                                fill="#5AC2EE"
                                p-id="35766"
                            ></path>
                        </svg>
                        <a
                            href="/"
                            class="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
                        >
                            DENTIGO
                        </a>
                    </div>
                    <div class="hidden sm:ml-6 sm:block">
                        <div class="flex space-x-4">
                            <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                            <a
                                href="/"
                                class="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Home
                            </a>
                            <a
                                href="/map"
                                class="rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                            >
                                Map
                            </a>
                        </div>
                    </div>
                </div>
                <div
                    v-if="!userStore.user"
                    class="absolute inset-y-0 right-0 hidden items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:block sm:pr-0"
                >
                    <button
                        class="btn btn-info btn-outline me-3"
                        @click="redirectToSignIn"
                    >
                        Log in
                    </button>
                </div>
                <div
                    v-else
                    class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
                >
                    <div class="dropdown dropdown-end">
                        <button
                            type="button"
                            class="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                            <span class="absolute -inset-1.5"></span>
                            <span class="sr-only">View notifications</span>
                            <span
                                v-if="unReadnotificationsNo > 0"
                                class="notification-badge"
                            >
                                {{ unReadnotificationsNo }}
                            </span>
                            <svg
                                class="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="1.5"
                                stroke="currentColor"
                                aria-hidden="true"
                                @click="toggleNotifications"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                                />
                            </svg>
                        </button>
                        <audio id="notificationSound" ref="audio" hidden="true">
                            <source
                                src="/src/assets/sounds/notifiction_tone.mp3"
                                type="audio/mpeg"
                            />
                        </audio>
                        <div
                            v-if="showNotifications"
                            class="dropdown-content toast toast-end toast-top z-[1]"
                        >
                            <div
                                class="scroll-container"
                                style="height: 200px; overflow-y: auto"
                            >
                                <div
                                    v-for="notification in notifications"
                                    :key="notification.id"
                                    class="notificationToast ... alert alert-info space-y-4 border-none bg-gradient-to-r from-gray-900 to-indigo-950 text-sm text-white"
                                >
                                    <Notification
                                        :notification="notification"
                                        @mark-as-read="
                                            markAsRead(notification.id)
                                        "
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="relative ml-3">
                        <div>
                            <details
                                id="user-menu-button"
                                type="button"
                                class="relative flex rounded-full bg-gray-800 text-sm"
                                aria-expanded="false"
                                aria-haspopup="true"
                            >
                                <summary class="user-summary">
                                    <span class="sr-only">Open user menu</span>
                                    <img
                                        class="h-8 w-8 rounded-full"
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        alt=""
                                    />
                                </summary>
                                <div
                                    class="menu dropdown-content rounded-box absolute right-0 z-[1] w-32 bg-base-100 p-2 shadow"
                                >
                                    <button @click="signOut">Log out</button>
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile menu, show/hide based on menu state. -->
        <div
            id="mobile-menu"
            class="block transition-all duration-300 sm:hidden"
            :class="{ hidden: !isMobileMenuVisible }"
        >
            <div class="space-y-1 px-2 pb-3 pt-2">
                <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" -->
                <a
                    href="/"
                    class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    Home
                </a>
                <a
                    href="/map"
                    class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    Map
                </a>

                <!-- Move Sign In and Sign Up buttons below Map on small screens -->
                <div v-if="!userStore.user">
                    <button
                        class="btn btn-info btn-outline mt-3 block"
                        @click="redirectToSignIn"
                    >
                        Log in
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, type Ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store'
import {
    getNotificationData,
    updateUnreadNotificationList,
    subscribeToBookingNotifications,
} from '../modules/notification/notifications'
import Notification from './NotificationComponent.vue'
import { on } from '../eventBus'

export default defineComponent({
    components: {
        Notification,
    },
    setup() {
        const isMobileMenuVisible = ref(false)

        const userStore = useUserStore()

        const router = useRouter()

        const redirectToSignIn = () => {
            router.push('/login')
        }

        const signOut = () => {
            sessionStorage.removeItem('user')
            userStore.user = null
        }

        const showNotifications = ref(true)
        const notifications: Ref<{ id: string; message: string }[]> = ref([])

        //Audio implementation inspired by "https://stackoverflow.com/questions/67702963/how-to-play-mp3-file-in-vue3"
        const audio = ref<HTMLAudioElement>()

        watch(
            () => userStore.user,
            async () => {
                try {
                    const notificationData = await getNotificationData()
                    notifications.value = notificationData
                } catch (err) {
                    console.error('Could not get notifications because:', err)
                }
            },
        )

        onMounted(async () => {
            try {
                const notificationData = await getNotificationData()
                notifications.value = notificationData
            } catch (err) {
                console.error('Could not get notifications because:', err)
            }
            subscribeToBookingNotifications()
            on(
                'newNotification',
                (notification: { id: string; message: string }) => {
                    notifications.value.unshift(notification)
                    audio.value?.play()
                },
            )
        })
        const toggleMobileMenu = () => {
            isMobileMenuVisible.value = !isMobileMenuVisible.value
        }
        const toggleNotifications = () => {
            showNotifications.value = !showNotifications.value
        }
        const markAsRead = async (id: string) => {
            try {
                notifications.value = await updateUnreadNotificationList(id)
            } catch (err) {
                console.error('Error in markAsRead', err)
            }
        }

        return {
            userStore,
            signOut,
            redirectToSignIn,
            isMobileMenuVisible,
            toggleMobileMenu,
            showNotifications,
            notifications,
            toggleNotifications,
            markAsRead,
            audio,
        }
    },
    computed: {
        unReadnotificationsNo() {
            return this.notifications.length
        },
    },
})
</script>

<style scoped>
/* ---------------------- NOTIFICATIONS --------------------- */
.notification-badge {
    position: absolute;
    top: 0;
    left: -10px;
    width: 20px;
    height: 20px;
    background-color: red;
    color: white;
    text-align: center;
    border-radius: 50%;
    font-size: 12px;
}
.notificationToast {
    display: flex;
    align-items: center;
    justify-content: center;
}
.toast {
    width: 70px;
    padding: 5px;
    overflow: visible;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.text-sm {
    font-size: 0.6rem;
}
.alert {
    margin-top: 10px !important;
}
@media (max-width: 768px) {
    .toast {
        width: 20px;
        padding: 5px;
    }
}
@media (max-width: 576px) {
    .toast {
        width: 90%;
        height: auto;
        overflow-y: auto;
    }
    .alert {
        margin-bottom: 5px;
    }
}
@media (max-width: 430px) {
    .toast {
        width: 100%;
        height: auto;
        overflow-y: auto;
        white-space: inherit;
    }
}

/* ---------------------- USER SETTINGS --------------------- */

.user-summary {
    list-style: none;
}

.user-summary::-webkit-details-marker {
    display: none;
}
</style>
