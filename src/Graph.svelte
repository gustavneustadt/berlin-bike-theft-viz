<script lang="ts">
	import { getContext } from 'svelte'
	import type { SvelteComponent } from "svelte"
	
	let data: TheftRecord[] = getContext("theftData")
	export let step: number
	export let stepCount: number
	export let component: SvelteComponent
</script>

<div class="graph">
	<svelte:component this={component} data={data} step={step} stepCount={stepCount}/>				
</div>

<style>
	.graph {
		/* position: sticky; */
		width: 100%;
		max-height: 100%;
	}
	
	.graph :global(.axis g .domain) {
		display: none;
	}
	.graph :global(.axis .tick text) {
		fill: var(--colorTextMuted);
		opacity: .7;
		font-variant-numeric: tabular-nums;
	}
	.graph :global(.axis .tick line) {
		stroke: var(--colorAccentPrimaryMuted);
		stroke-width: .5;
		opacity: .3;
	}
	.graph :global(svg) {
		width: 100%;
		height: 100%;
	}
	.graph :global(.bin) {
		fill: var(--color);
		stroke: none;
	}
	.graph :global(.bin-background) {
		fill: var(--color);
		/* stroke-width: .5; */
		/* stroke: var(--colorTextPrimary); */
		stroke: none;
	}
	
	.graph :global(.annotation-note-title tspan) {
		fill: var(--colorAccentPrimary);
		font-weight: 600;
		font-size: .7rem;
		/* font-variant-caps: all-small-caps; */
		text-transform: uppercase;
		font-variant-numeric: tabular-nums;
		letter-spacing: 1px;
	}
	
	.graph :global(.annotation-note-label tspan) {
		fill: var(--colorTextPrimary);
		font-weight: 300;
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
	}
	
	.graph :global(.annotation-connector path) {
		stroke: var(--colorTextMuted);
		fill: none;
		stroke-width: .5;
	}

	.graph :global(.annotation .connector-end) {
		fill: var(--colorAccentPrimary);
		stroke-width: 0;
		font-weight: 300;
		font-size: 1rem;
	}
	.graph :global(.annotation-note-bg) {
		display: none;
	}
	
	.graph :global(svg text.axis-label) {
		font-variant-caps: all-small-caps;	
		font-weight: 400;
		fill: var(--colorTextMutedDark);
		letter-spacing: .1em;
		font-size: .7rem;
	}
</style>
