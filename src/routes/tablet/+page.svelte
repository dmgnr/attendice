<script lang="ts">
  import { onMount } from "svelte";
  import { Toaster, toast } from "svelte-sonner";
  import { source } from "sveltekit-sse";
  import { page } from "$app/state";
  import Camera from "$lib/components/Camera.svelte";
  import Card from "$lib/components/Card.svelte";
  import CardImmediate from "$lib/components/CardImmediate.svelte";
  import Idle from "$lib/components/Idle.svelte";
  import TimeDisplay from "$lib/components/TimeDisplay.svelte";
  import UidInput from "$lib/components/UidInput.svelte";
  import { db, type LocalAttendance } from "$lib/local";
  import { checkLocal, syncAttendance, syncStudentsList } from "$lib/sync";
  import { submitUid, uploadPicture } from "./submit.remote";
    import { es } from "$lib/sse";

  const pageKey = page.url.searchParams.get("k");

  let camera = $state<Camera>();
  let idle = $state(true);
  let online = $state(true);
  let version = $state("null");

  const sse = es(`/tablet/ev?k=${pageKey}`, {
    async error() {
      online = false;
      console.log("reconnecting...");
      await new Promise((r) => setTimeout(r, 2000));
    },
    open() {
      online = true;
      syncAttendance(pageKey);
      syncStudentsList(pageKey);
    },
  });

  onMount(() => {
    syncAttendance(pageKey);
    syncStudentsList(pageKey);
  });

  async function submit(uid: string) {
    const id = toast.loading("กำลังส่งข้อมูล...", {
      duration: 30000,
      class: "font-google-sans",
    });
    try {
      let pict: string | undefined;
      try {
        pict = camera?.takePicture() || undefined;
      } catch (e) {
        console.error("Could not capture picture", e);
      }
      const rl = await checkLocal(uid);
      // show immediate response
      if (rl === 200)
        toast.custom(CardImmediate, {
          id,
          duration: 60000,
        });
      const r = rl === 200 ? await submitUid(uid) : ({ status: rl } as const);
      switch (r.status) {
        case 404:
          return toast.warning("ไม่พบรหัสนักเรียนนี้", { id, duration: 5000 });
        case 409:
          return toast.warning("คุณลงทะเบียนไปแล้ว", { id, duration: 5000 });
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
          if (pict) uploadPicture({ id: r.id, pict });
          break;
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("เกิดข้อผิดพลาดขึ้น", { id, duration: 5000 });
    }
  }

  const stats = sse.select("stats");
  const versionEv = sse.select("version");
  const attendanceStream = sse.select("attendance").json<LocalAttendance>();
  $effect(() => {
    async function check() {
      if (!$attendanceStream) return;
      if (!db.attend.where("id").equals($attendanceStream.id).count()) {
        await db.attend.add($attendanceStream);
      }
    }
    check();
  });
  $effect(() => {
    const newVer = $versionEv;
    if (!newVer) return;
    if (version === "null") {
      version = newVer;
      console.log(`Version\nClient: ${version}\nVersion: ${newVer}`);
      return;
    }
    if (version !== newVer) location.reload();
  });
</script>

<svelte:head>
  <title>Attendice</title>
</svelte:head>

<UidInput onUid={submit} />
<Camera bind:this={camera} active={!idle} />
<div class="flex w-dvw h-dvh font-google-sans select-none">
  <Toaster expand richColors position="top-right" />
  <Idle {idle} />
  <div class="flex grow h-fit">
    <TimeDisplay bind:idle {online} />
    {#if !idle}
      <span
        class="flex flex-col text-2xl p-1 m-2 rounded bg-[#fff5] justify-evenly items-center"
      >
        อยู่ในโรงเรียน
        <span class="text-2xl">{$stats}</span>
      </span>
    {/if}
  </div>
</div>
