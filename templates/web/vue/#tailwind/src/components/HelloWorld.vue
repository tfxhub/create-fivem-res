<script setup lang="ts">
import { ref } from 'vue';

defineProps<{ msg: string }>();

const count = ref(0);
</script>

<template>
    <div class="flex flex-col items-center">
        <h1 class="mb-4 text-center text-2xl font-bold">{{ msg }}</h1>

        <div class="mb-4 rounded-lg p-4 text-center">
            <button
                type="button"
                class="rounded bg-blue-500 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-600"
                @click="count++"
            >
                count is {{ count }}
            </button>
        </div>

        <p class="text-center text-white/70">
            Learn more about IDE Support for Vue in the
            <a
                href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
                target="_blank"
                class="text-blue-400 underline hover:text-blue-300"
                >Vue Docs Scaling up Guide</a
            >.
        </p>
    </div>
</template>
