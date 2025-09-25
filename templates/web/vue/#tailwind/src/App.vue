<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import { useVisibility } from './lib/visibility';

const { isVisible, closeUI } = useVisibility();
</script>

<template>
    <main v-if="isVisible" class="relative flex flex-col items-center rounded-2xl bg-black/50 p-8">
        <div class="absolute right-4 top-4">
            <button
                class="rounded-2xl bg-black/50 px-2 text-[1rem] text-white/50 hover:bg-red-500/80 hover:text-white"
                @click="closeUI"
            >
                X
            </button>
        </div>
        <div class="flex flex-row items-center justify-center">
            <a href="https://vite.dev" target="_blank" rel="noreferrer">
                <img
                    src="/vite.svg"
                    class="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
                    alt="Vite logo"
                />
            </a>
            <a href="https://vuejs.org/" target="_blank" rel="noreferrer">
                <img
                    src="./assets/vue.svg"
                    class="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#42b883aa]"
                    alt="Vue logo"
                />
            </a>
        </div>

        <div class="p-8">
            <HelloWorld msg="Vite + Vue + FiveM" />
        </div>

        <p class="text-white/70">
            Edit <code class="rounded bg-black/30 px-1 py-0.5">src/App.vue</code> and save to test HMR
        </p>
    </main>
</template>
