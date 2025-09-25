<script lang="ts">
    import svelteLogo from './assets/svelte.svg';
    import viteLogo from '/vite.svg';
    import Counter from './lib/Counter.svelte';
    import { isVisible } from './lib/state/visibility.svelte';
    import { request } from './lib/fivem';
</script>

{#if isVisible()}
    <main class="app">
        <div class="close-button">
            <button class="close-button-icon" onclick={() => request('ui.close', {})}>X</button>
        </div>
        <div class="logo-container">
            <a href="https://vite.dev" target="_blank" rel="noreferrer">
                <img src={viteLogo} class="logo" alt="Vite Logo" />
            </a>
            <a href="https://svelte.dev" target="_blank" rel="noreferrer">
                <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
            </a>
        </div>
        <h1>Vite + Svelte</h1>

        <div class="card">
            <Counter />
        </div>

        <p class="read-the-docs">
            Edit src/App.tsx and save to test HMR
        </p>
    </main>
{/if}

<style>
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
    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00aa);
    }
</style>
