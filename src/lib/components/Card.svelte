<script lang="ts">
  import { cn } from "$lib/utils";
  import * as Card from "./ui/card";

  const {
    img,
    name,
    time,
    room,
  }: { img?: string; name: string; time: Date; room: string } = $props();

  // svelte-ignore state_referenced_locally
  let latest = $state(!!img);

  let timeStr = $derived(
    time.toLocaleTimeString("en-GB", {
      hour12: false,
      timeStyle: "short",
      timeZone: "Asia/Bangkok",
    }),
  );
</script>

<svelte:window
  on:stalled={() => {
    latest = false;
  }}
/>

<Card.Root class={cn("w-89 font-google-sans", latest && "pt-0")}>
  {#if latest}
    <img
      src={img}
      alt="Event cover"
      class="aspect-video w-full object-cover rounded-t-xl"
    />
  {/if}
  <Card.Header>
    <Card.Title class="Title">
      <div class="flex w-full justify-between">
        <span>{name}</span>
        <span>{timeStr} น.</span>
      </div>
    </Card.Title>
    <Card.Description>ม. {room}</Card.Description>
  </Card.Header>
</Card.Root>
