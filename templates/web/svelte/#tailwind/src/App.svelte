<script lang="ts">
    import svelteLogo from './assets/svelte.svg';
    import viteLogo from '/vite.svg';
    import Counter from './lib/Counter.svelte';
    import { isVisible } from './lib/state/visibility.svelte';
    import { request } from './lib/fivem';
</script>

{#if isVisible()}
    <main class="relative flex flex-col items-center rounded-2xl bg-black/50 p-8">
        <div class="absolute right-4 top-4">
            <button
                class="rounded-2xl bg-black/50 px-2 text-[1rem] text-white/50"
                onclick={() => request('ui.close', {})}>X</button
            >
        </div>
        <div class="flex flex-row items-center justify-center">
            <a href="https://vite.dev" target="_blank" rel="noreferrer">
                <img
                    src={viteLogo}
                    class="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
                    alt="Vite Logo"
                />
            </a>
            <a href="https://svelte.dev" target="_blank" rel="noreferrer">
                <img
                    src={svelteLogo}
                    class="h-[6em] p-[1.5em] transition-[filter] duration-300 hover:drop-shadow-[0_0_2em_#ff3e00aa]"
                    alt="Svelte Logo"
                />
            </a>
        </div>
        <h1 class="text-2xl font-bold">Vite + Svelte + FiveM</h1>

        <div class="p-8">
            <Counter />
        </div>

        <p class="text-white/70">
            Edit <code class="rounded bg-black/30 px-1 py-0.5">src/App.tsx</code> and save to test HMR
        </p>
    </main>
{/if}
