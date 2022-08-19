<script lang="ts">
	import * as d3 from "d3"
	export let axis
	let axisWrapper: SVGElement
	
	$: {
		d3.select(axisWrapper).call(axis)
	}
</script>

<style>

</style>

<g bind:this={axisWrapper} {...$$props}>
</g>