<script lang="ts">
  import { onMount } from "svelte";

  const { active = true }: { active?: boolean } = $props();

  let cameraStream = $state<MediaStream>();
  let width = $state<number>(0);
  let height = $state<number>(0);
  let canvas = $state<HTMLCanvasElement>();
  let video = $state<HTMLVideoElement>();

  let isStarting = $state(false);

  async function startCamera() {
    if (cameraStream || isStarting) return;
    if (!navigator.mediaDevices?.getUserMedia) return;

    isStarting = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (!active) {
        stream.getTracks().map((track) => track.stop());
        return;
      }
      cameraStream = stream;
    } catch (error) {
      console.error("Error accessing the camera:", error);
    } finally {
      isStarting = false;
    }
  }

  function stopCamera() {
    if (!cameraStream) return;
    cameraStream.getTracks().map((track) => track.stop());
    cameraStream = undefined;
  }

  onMount(() => {
    if (active) startCamera();
    return () => stopCamera();
  });

  $effect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
    }
  });

  export function takePicture() {
    if (!canvas) return console.error("No canvas");
    const context = canvas.getContext("2d");
    if (!context) return console.error("No context");
    if (!video) return console.error("No video");
    context.drawImage(video, 0, 0, width, height);

    const imageDataUrl = canvas.toDataURL("image/png");
    return imageDataUrl;
  }
</script>

{#if active}
  <video
    autoplay
    playsinline
    srcobject={cameraStream}
    bind:videoWidth={width}
    bind:videoHeight={height}
    bind:this={video}
    class="fixed -z-10 top-0 left-0 min-w-full min-h-full object-cover -scale-x-100"
  ></video>
{:else}
  <div class="fixed -z-10 top-0 left-0 min-w-full min-h-full bg-black"></div>
{/if}

<canvas style="display:none;" {width} {height} bind:this={canvas}></canvas>
