<template>
    <div class="about">
        <div class="bg-white">
            <div class="max-w-8xl mx-auto py-6 sm:px-1 sm:py-8 lg:px-1">
                <div
                    id="web-introduction"
                    class="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0"
                >
                    <svg
                        viewBox="0 0 1024 1024"
                        class="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
                        aria-hidden="true"
                    >
                        <circle
                            cx="512"
                            cy="512"
                            r="512"
                            fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                            fill-opacity="0.7"
                        />
                        <defs>
                            <radialGradient
                                id="759c1415-0410-454c-8f7c-9a820de03641"
                            >
                                <stop stop-color="#7775D6" />
                                <stop offset="1" stop-color="#E935C1" />
                            </radialGradient>
                        </defs>
                    </svg>
                    <div
                        id="content"
                        class="mx-auto mb-6 max-w-md text-center lg:flex-auto lg:py-32 lg:text-center"
                    >
                        <h2
                            class="text-3xl font-bold tracking-tight text-white sm:text-3xl"
                        >
                            Making dental appointments easier than ever!
                        </h2>
                        <p class="mt-6 text-lg leading-8 text-gray-300">
                            We are committed to providing residents of
                            Gothenburg with a more convenient and efficient
                            dental appointment service.
                        </p>
                        <p
                            class="mt-6 text-lg leading-8 text-gray-300"
                            style="word-spacing: 1em; letter-spacing: 0.1em"
                        >
                            Convenient Real-time Regional
                        </p>
                        <div
                            class="mt-10 flex items-center justify-center gap-x-6"
                        >
                            <button
                                class="btn btn-primary"
                                @click="navigateToMap"
                            >
                                Map Search
                            </button>
                            <a
                                href="#dentists"
                                class="text-lg font-semibold leading-6 text-white"
                                >View Dentists
                                <span aria-hidden="true">→</span></a
                            >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
    setup() {
        const router = useRouter()
        const navigateToMap = () => {
            router.push('/map')
        }
        return {
            navigateToMap,
        }
    },
})
</script>

<style>
@media (min-width: 768px) {
    #web-introduction {
        height: 80vh;
    }
}
</style>
