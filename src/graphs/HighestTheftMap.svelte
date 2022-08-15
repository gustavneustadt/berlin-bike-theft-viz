<script lang="ts">
	import * as d3 from "d3"
	import { onMount, getContext } from "svelte"
	import { Tweened, tweened } from "svelte/motion";
	import { cubicInOut } from "svelte/easing";
	import type { FeatureCollection, Feature } from "geojson"
	import SvgRect from './../helper/SvgRect.svelte'

	let svg
	export let data: TheftRecord[]
	let featureData: FeatureCollection
	let hovering: boolean[] = []
	
	let weekDayFilter: number = null
	
	$: isHovering = hovering.includes(true)
	// $: centroid = featureData ? featureData.features.map((feature: Feature) => (): [number, number] => path.centroid(feature)) : []
	
	$: context = d3.select(svg)

	const { remap, colorScale, createColorScale, colors } = getContext("colors")
	
	$: rollupData = weekDayFilter ? data.filter((d: TheftRecord) => d.dateStart.getDay() === weekDayFilter) : data
	
	// $: console.log({rollupData})
	
	$: rollup = d3.rollup(
		data,
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
		bottom: 150,
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
		hoveredFeatureIndex = i
	}
	
	const unhover = (): void => {
		hovering = hovering.map(_ => false)
		hoveredFeatureIndex = null
	}
	
	const parseRelevantInformationFromFeature = (feature: Feature) => {
		if(feature === null) {
			return null
		}
		
		return {
			percentage: percentFormatter.format((rollup.get(Number(feature.properties.PLR_ID)) ?? 0) / sum * 100),
			name: feature.properties.PLR_NAME,
			thefts: numberFormatter.format(rollup.get(Number(feature.properties.PLR_ID)) ?? 0),
			centroid: path.centroid(feature)
		}
	}
	
	let hoveredFeatureIndex = null
	$: hoveredFeature = featureData ? featureData.features[hoveredFeatureIndex]: null
	
	let selectedFeatureIndex = null
	$: selectedFeature = selectedFeatureIndex ? featureData.features[selectedFeatureIndex] : maxFeature
	
	$: showFeature = hoveredFeature ? hoveredFeature : selectedFeature ? selectedFeature : null
	$: relevantDataShowFeature = parseRelevantInformationFromFeature(showFeature)
	
	const handleSelection = (e) => {
		selectedFeatureIndex = hoveredFeatureIndex
	}
	
	const handleMouseMove = (e: MouseEvent) => {
		const pos = getMousePosition(e)
		
		if(pos.x > margin.left + width ||
			pos.x < margin.left
		) {
			unhover()
		}
		if(pos.y > margin.top + height ||
			pos.y < margin.top
		) {
			unhover()
		}
	}
	
	function getMousePosition(e: MouseEvent) {
	  var CTM = svg.getScreenCTM();
	  return {
		x: (e.clientX - CTM.e) / CTM.a,
		y: (e.clientY - CTM.f) / CTM.d
	  };
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
	
	
	const x = d3.scaleBand()
		.domain([0, 1, 2, 3, 4, 5, 6])
		.range([0, width])
		.paddingOuter(-.25)
	
	$: y = d3.scaleLinear()
		.domain([maxSelectedData, 0])
		.range([0, 70])
	
	$: area = d3.area()
		.curve(d3.curveMonotoneX)
		.x( d => x(d[0]))
		.y1( d => y(d[1]))
		.y0(y(0))
		
	$: line = d3.line()
		.curve(d3.curveMonotoneX)
		.x( d => x(d[0]))
		.y( d => y(d[1]))

		
	$: maxSelectedData = selectedDataRolledUp ? Math.max(...selectedDataRolledUp.map(d => d[1])) : 0
	
	$: selectedData = showFeature ? 
	data.filter((d: TheftRecord) => d.lor === Number(showFeature.properties.PLR_ID))
	: null
	
	$: selectedDataRolledUp = selectedData ? d3.rollups(selectedData,
		(g: TheftRecord[]) => g.length,
		(d: TheftRecord) => d.dateEnd.getDay()
	) : null
	
	$: selectedDataFilled = selectedDataRolledUp ? x.domain().map((d: number) => selectedDataRolledUp.find((i: [number, number]) => i[0] === d) ?? [d, 0]) : []
	
	$: selectedDataPath = selectedDataFilled.filter((d: [number, number]) => d[1] > 0).length > 0 ? area(selectedDataFilled) : ""
	
	$: selectedDataLinePath = line(selectedDataFilled)
	
	const selectedDataMaxLinePos = (number: number): number => {
		switch(true) {
			case (number < 5): 
				return number
			case (number < 10):
				return Math.floor(number / 2) * 2
			default:
				return Math.floor(number / 10) * 10
		}
	}
	
	$: colorScaleSelectedData = createColorScale(colors.get("--colorBackground"), colors.get("--colorAccentPrimary"))
	
</script>

<style>
	svg :global(.district) {
		fill: var(--colorAccentPrimaryMuted);
	}
	
	svg :global(.annotation-bottom .annotation-note tspan) {
		text-anchor: middle;
	}
	
	svg {
		/* filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, .2)); */
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
		cursor: pointer;
	}
	svg .map path.hide {
		/* fill: var(--colorTextMutedDark); */
		opacity: .6;
	}
	
	svg .annotation-bottom .annotation-note-title tspan {
		fill: var(--colorAccentPrimaryMuted) !important;
	}
	
	svg .annotation-note-title tspan {
		letter-spacing: .12rem;
	}
	
	svg .annotation-bottom .annotation-connector path {
		stroke: var(--colorTextMutedDark);
		opacity: .6;
		stroke-width: 2;
		stroke-linecap: round;
	}
	
	
	svg .infotext {
		font-size: .5rem;
		fill: var(--colorTextMutedDark);
		/* font-variant-caps: all-small-caps; */
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
	.weekdays-maxline {
		stroke: var(--colorAccentPrimaryMuted);
		stroke-width: .5;
		opacity: .3;
	}
	.dataline {
		stroke: var(--colorAccentPrimaryMuted);
		stroke-width: 2;
		
	}
</style>

<svg bind:this={svg} pointer-events="all" viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet" on:mousemove={handleMouseMove} on:mouseleave={unhover}>
	
	<g transform="translate(0 {height + margin.verticalMargin - 70 - 20})">
		<text class="axis-label horizontal" dy={y(selectedDataMaxLinePos(maxSelectedData)) + 10}>
			{selectedDataMaxLinePos(maxSelectedData)}
		</text>
		{console.log(colors)}
		<linearGradient id="gradient" x1="0" x2="0" y1="1" y2="0">
			
			<stop offset="0%" stop-color={colorScaleSelectedData(0)} />
			<stop offset="100%" stop-color={colorScaleSelectedData(1)} />
		</linearGradient>
		
		{#if maxSelectedData > 0}
			<path 
			class="weekdays-maxline"
			d="
				M 0 {y(selectedDataMaxLinePos(maxSelectedData))},	
				L {width} {y(selectedDataMaxLinePos(maxSelectedData))}
			"/>
			<g transform="translate({x.bandwidth() / 2} 0)">
				<path d={selectedDataPath} fill="url(#gradient)" opacity={.3} />
				<path d={selectedDataLinePath} class="dataline" fill="none" stroke-linecap="round"/>
			</g>
		{/if}
	</g>
	<g transform="translate(0 {height + margin.verticalMargin - 20})" class="weekdays">
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
			<g class="weekday-wrapper" transform="translate({x(i)} 0)">
				<text dy={1.5} dx={x.bandwidth() / 2} alignment-baseline="hanging" class="weekday"
			    class:selected={i === weekDayFilter} text-anchor="middle">
					{weekday}
				</text>
				<SvgRect 
					on:click={() => weekDayFilter = i}
					
					class="weekday-background"
					r={5}
					height={20}
					width={x.bandwidth()}
				/>
			</g>
		{/each}
	</g>
	
	<clipPath id="mapClipPath">
		<rect width={width} height={height}/>
	</clipPath>
	<g transform="translate({margin.left} {margin.top})" clip-path="url(#mapClipPath)" width={width} height={height} on:click={handleSelection}>
		<g class="map" transform={getMapTransformString()} class:panable={mapZoomTransform.k > 1}>
			
			{#if featureData} 
				{#each featureData.features as feature, i}
					<path
					class:hide={isHovering ? hovering[i] ? false : true : false}
				    d={path(feature)} class="bin" style="--color: {color(feature)}" on:mouseenter={() => handleHovering(i)} 
					/>
				{/each}
			{/if}
		</g>
	</g>
	<g class="annotations" transform="translate(0 0)">
		{#if featureData}
			{#if showFeature}
			<g transform="translate({width / 2} {margin.top + height + 18})" class="annotation-bottom">
				<text class="annotation-note-title" text-anchor="middle">
					<tspan>
						{relevantDataShowFeature.name}
					</tspan>
				</text>
				<g transform="translate(10, 0)">
					<text class="annotation-note-label number" text-anchor="end" dy={20} dx={-5}>
						<tspan>
							{relevantDataShowFeature.thefts} Thefts
						</tspan>
					</text>
					<text class="annotation-note-label percent" text-anchor="start" dy={20} dx={5}>
						<tspan>
							{relevantDataShowFeature.percentage} %
						</tspan>
					</text>
					
				</g>
				<g class="annotation-connector">
					<path d="M 0 -15, 
					L 
					{((relevantDataShowFeature.centroid[0]) * mapZoomTransform.k) + mapZoomTransform.x - width / 2} 
					{clampNumber((relevantDataShowFeature.centroid[1]) * mapZoomTransform.k - height + mapZoomTransform.y - 18, -15, -height-18)}"/>
				</g>
			</g>
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
	{#if mapZoomTransform.k >= 1.2}
		<text class="infotext" x={width / 2} y={6} text-anchor="middle" transform="">
			Show all
		</text>
	{/if}
	{#if mapZoomTransform.k < 1.2}
		<text class="infotext" x={width / 2} y={6} text-anchor="middle" transform="">
			Hold ⌥ Option or Alt and Scroll to Zoom
		</text>
	{/if}
</svg>