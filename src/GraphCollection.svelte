<script lang="ts">
	import { getContext } from 'svelte'
	import { fade } from 'svelte/transition'
	import TotalSum from './graphs/TotalSum.svelte'
	import HighestDamageMonth from './graphs/HighestDamageMonth.svelte'
	import TotalSumWeek from './graphs/TotalSumWeek.svelte'
	import BikeValueGraph from './graphs/BikeValueGraph.svelte'
	import TimeTheftGraph from './graphs/TimeTheftGraph.svelte'
	
	export let index: number
	let data: TheftRecord[] = getContext("theftData")
	
	const graphCollection: Graph[] = [
		{
			textId: 0,
			component: TimeTheftGraph
		},
		{
			textId: 0,
			component: BikeValueGraph
		},
		{
			textId: 0,
			component: HighestDamageMonth
		},
		{
			textId: 0,
			component: TotalSum
		},
		{
			textId: 0,
			component: TotalSumWeek
		},
		{
			textId: 1,
			component: TotalSum
		}
	]
	
	
	export let graphsElements: HTMLDivElement[] = []
</script>

{#each graphCollection as graph, i}
	<div class="graph" bind:this={graphsElements[i]} data-text-id={graph.textId}>
		{#if index == i}
			<div class="transition" transition:fade={{duration: 200}}>
				<svelte:component this={graph.component} data={data}/>				
			</div>
		{/if}
	</div>
{/each}

<style>
	.graph {
		min-height: 70vh;
		max-height: 600px;
		position: relative;
	}
	.graph > * {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}
	
	.graph :global(.axis g .domain) {
		display: none;
	}
	.graph :global(.axis .tick text) {
		fill: var(--colorTextPrimary);
		opacity: .7;
		font-variant-numeric: tabular-nums;
	}
	.graph :global(.axis .tick line) {
		stroke: var(--colorTextPrimary);
		stroke-width: .5;
		opacity: .3;
	}
	.graph :global(svg) {
		width: 100%;
	}
	.graph :global(.bin) {
		fill: var(--colorAccentPrimaryRGB);
		fill: var(--colorAccentPrimary);
	}
	.graph :global(.bin-background) {
		fill: var(--colorTextMuted);
	}
</style>
