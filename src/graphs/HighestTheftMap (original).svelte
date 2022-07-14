<script lang="ts">
	import * as d3 from "d3"
	import { onMount, getContext } from "svelte"
	
	import type { FeatureCollection, Feature } from "geojson"
	
	let svg: SVGElement
	export let data: TheftRecord[]
	// let theftData: TheftRecord[] = getContext("theftData")
	
	const { remap, colorScale } = getContext("colors")
	
	$: rollup = d3.rollup(
		data,
		(g: TheftRecord[]) => g.length,
		(d: TheftRecord) => d.lor
	)
	
	$: colorBound = [
		0,
		d3.max(rollup.values())
	]
	
	const color = (feature: Feature) => {
		const number = rollup.get(Number(feature.properties.PLR_ID))
		if(!number) {
			return colorScale(0)
		}
		return colorScale(remap(number, colorBound, 1))
	}

	let featureData: FeatureCollection
	
	
	$: context = d3.select(svg)
	
	onMount( async () => {
		d3.json("./public/berlinPLR.geojson").then((d: FeatureCollection): void => {
			featureData = d
		})
	})
	
	$: handleZoom = (e): void => {
		context.select("g").attr("transform", e.transform)
	}

	
	const margin = {
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		get verticalMargin() {  
			return this.top + this.bottom 
		},
		get horizontalMargin() {
			return this.left + this.right
		}
	}

	const width: number = 450 - margin.horizontalMargin
	const height: number = 250 - margin.verticalMargin
	
	const zoom = d3.zoom()
	// .filter((e: WheelEvent) => {
	// 	return false;
	// })
	.on("zoom", handleZoom)
		.scaleExtent([1, 5])
		// .translateExtent([[0, 0], [width, height]])
	
	const projection = d3.geoMercator()
	$: path = d3.geoPath().projection(projection)
	$: if(featureData) {
		projection.fitSize([width, height], featureData)
	}
	
	$: if(context) { context.call(zoom) }
</script>

<style>
	svg :global(.district) {
		fill: var(--colorAccentPrimaryMuted);
	}
</style>


<svg bind:this={svg} pointer-events="all" viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet">
	<g>
		<g transform="translate({margin.left}, {margin.top})">
			<text class="axis-label horizontal"
				x={width / 2}
				y={height}
				text-anchor="middle"
			>
				Berlin
			</text>
			{#if featureData} 
				{#each featureData.features as feature}
					<path d={path(feature)} class="bin" style="--color: {color(feature)}"/>
				{/each}
			{/if}
			
		</g>
	</g>
</svg>