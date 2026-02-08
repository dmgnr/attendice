<script lang="ts">
  let {
    value = $bindable(""),
    onUid,
  }: { value?: string; onUid?: (uid: string) => void } = $props();

  // number key language translation
  const translationMapRaw = "1234567890ๅ/-ภถุึคตจ";
  const translationMap: Record<string, string> = {};
  for (let i = 0; i < translationMapRaw.length / 2; i++) {
    translationMap[translationMapRaw[i + translationMapRaw.length / 2]] =
      translationMapRaw[i];
  }

  function keydown(e: KeyboardEvent) {
    const { key } = e;
    const translated = translationMap[key] || key;
    if (!translationMapRaw.includes(translated)) return;
    value += translated;
    // console.log(value);
    if (onUid && value.length >= 10) {
      onUid(value);
      value = "";
    }
  }

  // if input went idle for 1 seconds, clean it
  // card reader should take no more than 100ms between characters
  $effect(() => {
    if (!value) return;
    const timeout = setTimeout(() => {
      value = "";
    }, 1000);
    return () => clearTimeout(timeout);
  });
</script>

<svelte:window
  on:keydown={keydown}
  oncontextmenu={(ev) => ev.preventDefault()}
/>
