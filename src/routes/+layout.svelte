<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.png";

	const { children } = $props();
</script>

<svelte:head
	><link rel="icon" href={favicon} /><meta
		name="darkreader"
		content="disable"
	/></svelte:head
>
{@render children()}
