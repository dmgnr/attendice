<script lang="ts">
  import ClockFading from "@lucide/svelte/icons/clock-fading";

  export const { idle = false } = $props();
</script>

{#if idle}
  <div
    class="flex flex-col gap-2 justify-center items-center absolute top-0 left-0 bottom-0 right-0 text-gray-600 text-4xl"
  >
    <ClockFading size={200} />
    นอกเวลาเข้าออก
  </div>
{/if}
