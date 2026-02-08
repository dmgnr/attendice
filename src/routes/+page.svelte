<script lang="ts">
  import { Toaster, toast } from "svelte-sonner";
  import Camera from "$lib/components/Camera.svelte";
  import Card from "$lib/components/Card.svelte";
  import Idle from "$lib/components/Idle.svelte";
  import TimeDisplay from "$lib/components/TimeDisplay.svelte";
  import UidInput from "$lib/components/UidInput.svelte";
  import { getStats, submitUid } from "./submit.remote";

  let camera = $state<Camera>();
  let idle = $state(true);
  let stats = $state("...");
  async function submit(uid: string) {
    const id = toast.loading("กำลังส่งข้อมูล...", { duration: 30000 });
    try {
      let pict: string | undefined;
      try {
        pict = camera?.takePicture() || undefined;
      } catch (e) {
        console.error("Could not capture picture", e);
      }
      // const res = await fetch("/api/submit", {
      //   method: "POST",
      //   body: JSON.stringify({ uid }),
      // });
      const r = await submitUid({ uid, pict });
      console.log(r);
      switch (r.status) {
        case 404:
          return toast.warning("ไม่พบรหัสนักเรียนนี้", { id });
        case 409:
          return toast.warning("คุณลงทะเบียนไปแล้ว", { id });
        case 200: {
          const json: { name: string; room: string } = r.student;
          console.log(json);
          // remove image from any older toasts
          window.dispatchEvent(new Event("stalled"));
          toast.custom(Card, {
            id,
            duration: 60000, // a minute
            componentProps: {
              time: new Date(),
              img: pict,
              ...json,
            },
          });
          break;
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("เกิดข้อผิดพลาดขึ้น", { id });
    }
  }
  $effect(() => {
    async function fetchStats() {
      stats = await getStats();
    }
    const interval = setInterval(fetchStats, 60000);
    fetchStats();
    return () => clearInterval(interval);
  });
</script>

<UidInput onUid={submit} />
<Camera bind:this={camera} active={!idle} />
<div class="flex w-dvw h-dvh font-google-sans select-none">
  <Toaster expand richColors position="top-right" />
  <Idle {idle} />
  <div class="flex grow h-fit">
    <TimeDisplay bind:idle />
    {#if !idle}
      <span
        class="flex flex-col text-2xl p-1 m-2 rounded bg-[#fff5] justify-evenly items-center"
      >
        อยู่ในโรงเรียน
        <span class="text-2xl">{stats}</span>
      </span>
    {/if}
  </div>
</div>
