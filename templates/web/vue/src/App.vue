<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue';
import { useVisibility } from './lib/visibility';

const { isVisible, closeUI } = useVisibility();
</script>

<template>
    <main v-if="isVisible" class="app">
        <div class="close-button">
            <button class="close-button-icon" @click="closeUI">X</button>
        </div>
        <div class="logo-container">
            <a href="https://vite.dev" target="_blank" rel="noreferrer">
                <img src="/vite.svg" class="logo" alt="Vite logo" />
            </a>
            <a href="https://vuejs.org/" target="_blank" rel="noreferrer">
                <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
            </a>
        </div>
        <div class="card">
            <HelloWorld msg="Vite + Vue + FiveM" />
        </div>
        <p class="read-the-docs">Edit src/App.vue and save to test HMR</p>
    </main>
</template>

<style scoped>
.app {
    position: relative;
    background-color: #00000080;
    padding: 2rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
}

.close-button-icon {
    background-color: #00000080;
    border-radius: 1rem;
    color: #ffffff80;
    font-size: 0.7rem;
    border: none;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
}

.close-button-icon:hover {
    background-color: #ff000080;
    color: #ffffff;
}

.logo-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}

.card {
    margin: 1rem 0;
}

.read-the-docs {
    color: #888;
    margin-top: 1rem;
}
</style>
