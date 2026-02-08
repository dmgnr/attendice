<script lang="ts">
  import { House, School, Wifi } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  let { idle = $bindable(false), io = $bindable<"in" | "out">("in") } =
    $props();

  let time = $state("00:00:00");
  $effect(() => {
    function tick() {
      const now = new Date();
      const hour = (now.getUTCHours() + 7) % 24;
      if (hour > 20) idle = true;
      else if (hour < 5) idle = true;
      else idle = false;
      if (hour >= 12) {
        if (io !== "out") io = "out";
      } else if (io !== "in") io = "in";
      time = now.toLocaleTimeString("en-GB", {
        hour12: false,
        timeZone: "Asia/Bangkok",
      });
    }
    const timeout = setInterval(tick, 1000);
    tick();
    return () => clearInterval(timeout);
  });
</script>

<span
  class={cn(
    "flex flex-col text-6xl p-1 m-2 rounded",
    idle ? "text-gray-400" : "bg-[#fff5]",
  )}
>
  {#if idle}
    <div class="flex justify-evenly">{time}<span>น.</span></div>
  {:else}
    <div class="flex justify-evenly">{time}<span>น.</span></div>
    <div class="flex justify-between items-center pr-1">
      <span class="flex text-2xl px-1 rounded gap-1 items-center">
        {#if io == "in"}<School class="text-emerald-600" /> เวลาเข้า
        {:else}<House class="text-red-600" /> เวลาออก{/if}
      </span>
      <Wifi class="text-emerald-600" />
    </div>
  {/if}
  <span class="h-0 overflow-hidden">10:00:00 น.</span>
</span>
