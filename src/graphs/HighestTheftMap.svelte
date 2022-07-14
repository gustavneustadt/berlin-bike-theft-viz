<script lang="ts">
	import * as d3 from "d3"
	import { onMount, getContext } from "svelte"
	import Annotation from '../helper/Annotation.svelte'
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
	$: sum = data.length
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
	let hovering: boolean[] = []
	$: isHovering = hovering.includes(true)
	$: centroid = featureData ? featureData.features.map((feature: Feature) => (): [number, number] => path.centroid(feature)) : []
	$: context = d3.select(svg)
	
	onMount( async () => {
		d3.json("./public/berlinPLR.geojson").then((d: FeatureCollection): void => {
			featureData = d
			hovering = d.features.map(_ => false)
		})
	})
	let mapZoomTransform: {
		k: number,
		x: number,
		y: number
	} = {
		k: 1,
		x: 0,
		y: 0
	}
	
	$: getMapTransformString = () => {
		return `translate(${mapZoomTransform.x} ${mapZoomTransform.y}) scale(${mapZoomTransform.k})`
	}
	
	const handleZoom = (e): void => {
		mapZoomTransform = {
			k: e.transform.k,
			x: e.transform.x - margin.horizontalMargin / 2,
			y: e.transform.y - margin.verticalMargin / 2
		}
	}
	

	const margin = {
		top: 0,
		left: 0,
		right: 0,
		bottom: 50,
		get verticalMargin() {  
			return this.top + this.bottom 
		},
		get horizontalMargin() {
			return this.left + this.right
		}
	}

	const width: number = 450 - margin.horizontalMargin
	const height: number = 380 - margin.verticalMargin
	
	const zoom = d3.zoom().on("zoom", handleZoom)
		.filter((e: WheelEvent) => e.metaKey ? true : false)
		.scaleExtent([1, 5])
		.translateExtent([[0, 0], [width, height]])
	
	const projection = d3.geoMercator()
	$: path = d3.geoPath().projection(projection)
	$: if(featureData) {
		projection.fitSize([width, height], featureData)
	}
	
	$: if(context) { 
		context.call(zoom) 
	}
	
	const numberFormatter = Intl.NumberFormat("fr", {
		
	})
	
	const percentFormatter = Intl.NumberFormat("en", {
		minimumIntegerDigits: 1,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
</script>

<style>
	svg :global(.district) {
		fill: var(--colorAccentPrimaryMuted);
	}
	
	svg :global(.annotation-note tspan) {
		text-anchor: middle;
	}
	
	svg {
		filter: drop-shadow(0px 5px 0px rgba(0, 0, 0, .2));
	}
	
	/* svg :global(.annotation-note-label.number tspan) {
	} */
	svg :global(.annotation-note-label.percent tspan), svg :global(.annotation-note-label.number tspan) {
		font-variant-numeric: oldstyle-nums tabular-nums;
	}
	svg :global(.annotation-note-label.percent tspan) {
		fill: var(--colorTextMuted);
	}
	
	svg .map path {
		transition: opacity .1s ease-in-out;
	}
	svg .map path.hide {
		/* fill: var(--colorTextMutedDark); */
		opacity: .6;
	}
</style>

<svg bind:this={svg} pointer-events="all" viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet">
	<clipPath id="mapClipPath">
		<rect width={width} height={height}/>
	</clipPath>
	{#if !isHovering}
		<text class="axis-label horizontal"
			x={width / 2}
			y={height + 20}
			text-anchor="middle"
		>
			Berlin
		</text>
	{/if}
	<g transform="translate({margin.left} {margin.top})" clip-path="url(#mapClipPath)" width={width} height={height}>
		<g class="map" transform={getMapTransformString()}>
			{#if featureData} 
				{#each featureData.features as feature, i}
					<path
					class:hide={isHovering ? hovering[i] ? false : true : false}
				    d={path(feature)} class="bin" style="--color: {color(feature)}" on:mouseenter={() => hovering[i] = true} on:mouseleave={() => hovering[i] = false}/>
				{/each}
			{/if}
		</g>
	</g>
	<g class="annotations" transform="translate(0 {height})">
		{#if featureData} 
			{#each hovering as hover, i}
				{#if hover}
					<g transform="translate({width / 2} 18)">
						<text class="annotation-note-title" text-anchor="middle">
							<tspan>
								{featureData.features[i].properties.PLR_NAME}
							</tspan>
						</text>
						<g transform="translate(-10, 0)">
							<text class="annotation-note-label number" text-anchor="end" dy={20} dx={-5}>
								<tspan>
									{numberFormatter.format(rollup.get(Number(featureData.features[i].properties.PLR_ID)) ?? 0)}
								</tspan>
							</text>
							<text class="annotation-note-label percent" text-anchor="start" dy={20} dx={5}>
								<tspan>
									{percentFormatter.format((rollup.get(Number(featureData.features[i].properties.PLR_ID)) ?? 0) / sum * 100)} %
								</tspan>
							</text>
							
						</g>
					</g>
					<g class="annotation-connector">
						<path d="M {width / 2} 0, L {((centroid[i]()[0]) * mapZoomTransform.k) + mapZoomTransform.x} {(centroid[i]()[1]) * mapZoomTransform.k - height + mapZoomTransform.y}"/>
						
					</g>
				
					<!-- <Annotation
						note={{
							title: featureData.features[i].properties.PLR_NAME,
							label: `${numberFormatter.format(rollup.get(Number(featureData.features[i].properties.PLR_ID)))}`,
							lineType: "none",
							align: "middle",
							wrap: width
						}}
						x={((centroid[i]()[0]) * mapZoomTransform.k) + mapZoomTransform.x}
						y={(centroid[i]()[1]) * mapZoomTransform.k - height + mapZoomTransform.y}
						dx={width / 2 - ((centroid[i]()[0] * mapZoomTransform.k) + mapZoomTransform.x)}
						dy={- (centroid[i]()[1] * mapZoomTransform.k - height + mapZoomTransform.y) + 10}
					/> -->
				{/if}
			{/each}
		{/if}
	</g>
</svg>