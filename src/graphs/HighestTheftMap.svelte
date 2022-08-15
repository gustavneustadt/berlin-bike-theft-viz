<script lang="ts">
	import * as d3 from "d3"
	import { onMount, getContext } from "svelte"
	import { Tweened, tweened } from "svelte/motion";
	import { cubicInOut } from "svelte/easing";
	import type { FeatureCollection, Feature } from "geojson"
	import SvgRect from './../helper/SvgRect.svelte'

	let svg: SVGElement
	export let data: TheftRecord[]
	let featureData: FeatureCollection
	let hovering: boolean[] = []
	
	let weekDayFilter: number = 0
	
	$: isHovering = hovering.includes(true)
	$: centroid = featureData ? featureData.features.map((feature: Feature) => (): [number, number] => path.centroid(feature)) : []
	
	$: context = d3.select(svg)

	const { remap, colorScale } = getContext("colors")
	
	$: rollupData = data.filter((d: TheftRecord) => d.dateStart.getDay() === weekDayFilter)
	
	$: console.log({rollupData})
	
	$: rollup = d3.rollup(
		rollupData,
		(g: TheftRecord[]) => g.length,
		(d: TheftRecord) => d.lor
	)
	
	
	// $: console.log(rollupWeekDay)
	
	$: sum = data.length
	$: colorBound = [
		0,
		d3.max(rollup.values())
	]
	
	const clampNumber = (num: number, a:number, b:number) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b))
	
	$: maxItem = [...rollup.entries()].find(([key, value]: [number, number]) => value === colorBound[1])
	
	$: maxFeature = featureData ? featureData.features.find((d: Feature) => Number(d.properties.PLR_ID) === maxItem[0]) : null
	$: maxFeatureIndex = featureData ? featureData.features.findIndex((d: Feature) => Number(d.properties.PLR_ID) === maxItem[0]) : null
	
	$: color = (feature: Feature) => {
		const number = rollup.get(Number(feature.properties.PLR_ID))
		if(!number) {
			return colorScale(0)
		}
		return colorScale(remap(number, colorBound, 1))
	}

	
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
	
	let paning = false
	
	const handleZoom = (e): void => {
		paning = true	
		mapZoomTransform = {
			k: e.transform.k,
			x: e.transform.x - margin.horizontalMargin / 2,
			y: e.transform.y - margin.verticalMargin / 2
		}
	}
	

	const margin = {
		top: 30,
		left: 0,
		right: 0,
		bottom: 100,
		get verticalMargin() {  
			return this.top + this.bottom 
		},
		get horizontalMargin() {
			return this.left + this.right
		}
	}

	const width: number = 450 - margin.horizontalMargin
	const height: number = 450 - margin.verticalMargin
	
	const zoom = d3.zoom().on("zoom", handleZoom)
		.filter((e: WheelEvent) => e.altKey ? true : false)
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
	
	$: maxFeatureCentroid = maxFeature ? path.centroid(maxFeature) : [0, 0]
	
	const handleHovering = (i: number) => {
		unhover()
		hovering[i] = true
	}
	const unhover = (): void => {
		hovering = hovering.map(_ => false)
	}
	
	const dayFormatter = new Intl.DateTimeFormat("en", {
		weekday: "short"
	})
	
	const weekdays: string[] = [...Array(7)].map((_, d: number): [number, string] => {
		const date = new Date
		date.setDate(d)
		return [date.getDay(), dayFormatter.format(date)]
	}).sort().map(d => d[1])
	
	const weekdaySelectPosition = (weekday) => {
		return (weekday + .5)*(width / weekdays.length)
	}
	
	const weekdayPosition: Tweened<number> = tweened(weekdaySelectPosition(weekDayFilter), {
		duration: 300,
		easing: cubicInOut
	})
	
	$: weekdayPosition.set(weekdaySelectPosition(weekDayFilter))
	
</script>

<style>
	svg :global(.district) {
		fill: var(--colorAccentPrimaryMuted);
	}
	
	svg :global(.annotation-bottom .annotation-note tspan) {
		text-anchor: middle;
	}
	
	svg {
		filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, .2));
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
	/* svg .map.panable {
		cursor: grab;
	} */
	svg .map path.hide {
		/* fill: var(--colorTextMutedDark); */
		opacity: .6;
	}
	svg .annotation-bottom .annotation-connector path {
		stroke: var(--colorAccentPrimary);
		stroke-width: 2;
		stroke-linecap: round;
	}
	svg .infotext {
		font-size: .5rem;
		fill: var(--colorTextMutedDark);
		font-variant-caps: all-small-caps;
		letter-spacing: .05rem;
	}
	.weekday {
		fill: var(--colorTextMuted);
		font-variant-caps: all-small-caps;
		letter-spacing: .1rem;
	}
	.weekday-wrapper:hover .weekday {
		fill: var(--colorAccentPrimaryMuted);
	}
	
	.weekday-wrapper {
		cursor: pointer;
	}
	
	.weekday.selected {
		fill: var(--colorAccentPrimary);
		font-weight: 500;
	}
	
	svg :global(.weekday-background) {
		fill: transparent;
		/* stroke: var(--colorTextMutedDark);
		stroke-width: .5; */
	}
	svg :global(.weekday-select-background) {
		fill: var(--colorAccentPrimary);
	}
</style>

<svg bind:this={svg} pointer-events="all" viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet" on:mouseleave={unhover}>
	<g transform="translate(0 {height + 100})" class="weekdays">
			<SvgRect 
				x={$weekdayPosition}
				xFunc={(rectWidth, _) => rectWidth / -2}
				class="weekday-select-background"
				r={1}
				y={20}
				height={2}
				width={40}
			/>
		{#each weekdays as weekday, i}
			<g class="weekday-wrapper" transform="translate({(i + .5)*(width / weekdays.length)} 0)">
				<text dy={1.5} alignment-baseline="hanging" class="weekday"
			    class:selected={i === weekDayFilter} text-anchor="middle">
					{weekday}
				</text>
				<SvgRect 
					on:click={() => weekDayFilter = i}
					xFunc={(rectWidth, _) => {
						return rectWidth / -2
					}}
					class="weekday-background"
					r={5}
					height={20}
					width={50}
				/>
			</g>
		{/each}
	</g>
	
	<clipPath id="mapClipPath">
		<rect width={width} height={height}/>
	</clipPath>
	<g transform="translate({margin.left} {margin.top})" clip-path="url(#mapClipPath)" width={width} height={height}>
		<g class="map" transform={getMapTransformString()} class:panable={mapZoomTransform.k > 1}>
			{#if featureData} 
				{#each featureData.features as feature, i}
					<path
					class:hide={isHovering ? hovering[i] ? false : true : false}
				    d={path(feature)} class="bin" style="--color: {color(feature)}" on:mouseenter={() => handleHovering(i)}/>
				{/each}
			{/if}
		</g>
	</g>
	<g class="annotations" transform="translate({margin.left} {margin.top + height})">
		{#if featureData}
			{#if isHovering}
				{#each hovering as hover, i}
					{#if hover}
						<g transform="translate({width / 2} 18)" class="annotation-bottom">
							<text class="annotation-note-title" text-anchor="middle">
								<tspan>
									{featureData.features[i].properties.PLR_NAME}
								</tspan>
							</text>
							<g transform="translate(10, 0)">
								<text class="annotation-note-label number" text-anchor="end" dy={20} dx={-5}>
									<tspan>
										{numberFormatter.format(rollup.get(Number(featureData.features[i].properties.PLR_ID)) ?? 0)} Thefts
									</tspan>
								</text>
								<text class="annotation-note-label percent" text-anchor="start" dy={20} dx={5}>
									<tspan>
										{percentFormatter.format((rollup.get(Number(featureData.features[i].properties.PLR_ID)) ?? 0) / sum * 100)} %
									</tspan>
								</text>
								
							</g>
							<g class="annotation-connector">
								<path d="M 0 -15, 
								L 
								{((centroid[i]()[0]) * mapZoomTransform.k) + mapZoomTransform.x - width / 2} 
								{clampNumber((centroid[i]()[1]) * mapZoomTransform.k - height + mapZoomTransform.y - 18, -15, -height-18)}"/>
								
							</g>
						</g>
					{/if}
				{/each}
			{:else}
				{#if maxFeature}
					<g transform="translate({width / 2} 18)" class="annotation-bottom">
						<text class="annotation-note-title" text-anchor="middle">
							<tspan>
								{maxFeature.properties.PLR_NAME}
							</tspan>
						</text>
						<g transform="translate(10, 0)">
							<text class="annotation-note-label number" text-anchor="end" dy={20} dx={-5}>
								<tspan>
									{numberFormatter.format(maxItem[1])} Thefts
								</tspan>
							</text>
							<text class="annotation-note-label percent" text-anchor="start" dy={20} dx={5}>
								<tspan>
									{percentFormatter.format(maxItem[1] / sum * 100)} %
								</tspan>
							</text>
							
						</g>
						<g class="annotation-connector">
							<path d="M 0 -15, 
							L 
							{((maxFeatureCentroid[0]) * mapZoomTransform.k) + mapZoomTransform.x - width / 2} 
							{clampNumber((maxFeatureCentroid[1] * mapZoomTransform.k - height + mapZoomTransform.y - 15), -15, -height-18)}"/>
							
						</g>
					</g>
				{/if}
			{/if}
		{/if}
	</g>
	<text class="axis-label horizontal"
		x={width / 2}
		y={20}
		text-anchor="middle"
	>
		Berlin
	</text>
	{#if mapZoomTransform.k < 1.2}
		<text class="infotext" x={width / 2} y={5} text-anchor="middle" transform="">
			Hold ⌥ Option or Alt and Scroll to Zoom
		</text>
	{/if}
</svg>