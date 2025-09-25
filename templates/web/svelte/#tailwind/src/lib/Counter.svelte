<script lang="ts">
    let count: number = $state(0);
    const increment = () => {
        count += 1;
    };
</script>

<button
    class="rounded-lg border border-transparent bg-neutral-900 px-5 py-2 text-white transition-colors hover:border-[#646cff] focus:outline-4 focus:outline-[--webkit-focus-ring-color]"
    onclick={increment}
>
    count is {count}
</button>
