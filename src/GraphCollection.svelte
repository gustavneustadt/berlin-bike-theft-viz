<script lang="ts">
	import { getContext } from 'svelte'
	import { fade } from 'svelte/transition'
	import * as d3 from "d3"
	import TotalSum from './graphs/TotalSum.svelte'
	import HighestDamageMonth from './graphs/HighestDamageMonth.svelte'
	import TotalSumWeek from './graphs/TotalSumWeek.svelte'
	import BikeValueGraph from './graphs/BikeValueGraph.svelte'
	import TimeTheftGraph from './graphs/TimeTheftGraph.svelte'
	
	export let index: number
	export let progress: number
	
	let data: TheftRecord[] = getContext("theftData")
	
	const graphCollection: Graph[] = [
		{
			textId: 0,
			component: BikeValueGraph
		},
		{
			textId: 1,
			component: TimeTheftGraph
		},
		{
			textId: 2,
			component: HighestDamageMonth
		},
		{
			textId: 3,
			component: TotalSum
		},
		{
			textId: 4,
			component: TotalSumWeek
		},
		{
			textId: 5,
			component: TotalSum
		}
	]
	
	$: graph = graphCollection.find((d: Graph) => d.textId === index)
	$: component = graph ? graph.component : null
	
	let opacityScale = d3.scaleLinear()
		.domain([0, 0.3, 0.7, 1])
		.range([0, 100, 100, 0])
		
	$: opacity = opacityScale(progress)
	
</script>

<div class="graph">
	<div class="transition" transition:fade={{duration: 200}} style="opacity: {opacity}%">
		<svelte:component this={component} data={data}/>				
	</div>
</div>

<style>
	.graph {
		position: sticky;
		top: 50%;
		transform: translateY(-50%);
		height: auto;
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
	}
	.graph :global(.bin) {
		fill: var(--colorAccentPrimary);
		stroke: none;
	}
	.graph :global(.bin-background) {
		fill: var(--colorTextMuted);
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
		fill: var(--colorAccentPrimary);
		stroke-width: .5;
	}
	
	.graph :global(.annotation .note-line) {
		stroke: none;
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
	
	/* .graph :global(.highlight .annotation-note-bg) {
		display: block;
		fill: var(--colorTextMuted);
		fill-opacity: .1;
	} */
</style>
