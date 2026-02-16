<script lang="ts">
  import ClockCheck from "@lucide/svelte/icons/clock-check";
  import * as Card from "./ui/card";
</script>

<Card.Root class="w-89 pt-0 relative">
  <div
    class="absolute top-0 left-0 bottom-0 right-0 bg-sky-100 rounded-xl flex justify-center items-center"
  >
    <ClockCheck size="150" class="text-emerald-500" />
  </div>
  <div class="aspect-video w-full object-cover rounded-t-xl"></div>
  <Card.Header>
    <Card.Title>Dummy</Card.Title>
    <Card.Description>ม. 1/1</Card.Description>
  </Card.Header>
</Card.Root>
