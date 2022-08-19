<script lang="ts">
	import * as d3 from "d3"
	import { onMount, getContext } from "svelte"
	import { Tweened, tweened } from "svelte/motion";
	import { cubicInOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import type { FeatureCollection, Feature } from "geojson"
	// import SvgRect from './../helper/SvgRect.svelte'
	import TweenHelper from './../helper/TweenHelper.svelte'

	let svg: SVGGraphicsElement
	export let data: TheftRecord[]
	let featureData: FeatureCollection
	let hovering: boolean[] = []
	
	let weekDayFilter: number = null
	
	$: isHovering = hovering.includes(true)
	// $: centroid = featureData ? featureData.features.map((feature: Feature) => (): [number, number] => path.centroid(feature)) : []
	
	$: context = d3.select(svg)

	const { remap, colorScale, createColorScale, colors } = getContext("colors")
	
	
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
	
	$: color = (feature: Feature) => {
		const number = rollup.get(Number(feature.properties.PLR_ID))
		if(!number) {
			return colorScale(0)
		}
		return colorScale(remap(number, colorBound, 1))
	}

	
	onMount( async () => {
		d3.json("./berlinPLR.geojson").then((d: FeatureCollection): void => {
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
		if(!feature) {
			return null
		}
		
		return {
			percentage: Number((rollup.get(Number(feature.properties.PLR_ID)) ?? 0)) / sum * 100,
			name: feature.properties.PLR_NAME,
			thefts: Number(rollup.get(Number(feature.properties.PLR_ID))) ?? 0,
			centroid: path.centroid(feature)
		}
	}
	
	let hoveredFeatureIndex = null
	let selectedFeatureIndex = null
	
	$: showFeature = showFeatureIndex ? featureData?.features.at(showFeatureIndex) : featureData?.features.find((d: Feature) => Number(d.properties.PLR_ID) === maxItem.at(0))
	$: showFeatureIndex = hoveredFeatureIndex ?? selectedFeatureIndex
	
	
	$: console.log(maxItem, featureData?.features)
	
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
	
	const x = d3.scaleBand()
		.domain([0, 1, 2, 3, 4, 5, 6])
		.range([50, width - 50])
		.paddingOuter(-.25)
	
	const y = d3.scaleLinear()
		// .exponent(1)
		.domain([1, 0])
		.range([0, 40])
	
	$: area = d3.area()
		.curve(d3.curveMonotoneX)
		.x( (_, i) => x(i))
		.y1( d => y(d))
		.y0(y(0))
	
	$: line = d3.line()
		.curve(d3.curveMonotoneX)
		.x( (_, i) => x(i))
		.y( d => y(d))
		
	type WeeklyData = [number, number, number, number, number, number, number]
	
	const getWeeklyDataOfMapFeature = 
		(feature: Feature): WeeklyData => {
		
		if(!feature) {
			return [0, 0, 0, 0, 0, 0, 0]
		}
		
		const selectedData = data.filter((d: TheftRecord) => d.lor === Number(feature?.properties.PLR_ID ?? 0))
		
		const rolledUp =  d3.rollups(selectedData,
			(g: TheftRecord[]) => g.length,
			(d: TheftRecord) => d.dateEnd.getDay()
		)
		
		const selectedDataFilled: WeeklyData = x.domain().map(
		(weekday: number) =>
			rolledUp?.find((i: [number, number]) => i[0] === weekday)?.at(1) ?? 0
		)
		
		return selectedDataFilled
	}
	type HourlyData = [
		number, number, number, 
		number, number, number, 
		number, number, number,
		number, number, number,
		number, number, number,
		number, number, number,
		number, number, number,
		number, number, number,
	]
	
	const getEmptyHourlyData = (): HourlyData => {
		return [
			0, 0, 0, 
			0, 0, 0, 
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
			0, 0, 0,
		]
	}
	
	const getHourlyDataOfMapFeature = 
	(feature: Feature): HourlyData => {
		
		if(!feature) {
			return getEmptyHourlyData()
		}
		
		const selectedData = data.filter((d: TheftRecord) => d.lor === Number(feature?.properties.PLR_ID ?? 0))
		
		const dateRanges = selectedData.reduce((acc: HourlyData, i: TheftRecord) => {
			i.dateRange.forEach((j: TheftRecordProbItem) => {
					acc[j.date.getHours()] += j.probScore
			})
			
			return acc
		}, getEmptyHourlyData())
		
		return dateRanges
	}
	
	$: maxSelectedData = Math.max(...selectedDataFilled)
	
	$: selectedDataFilled = getWeeklyDataOfMapFeature(showFeature)

	$: selectedDataPath = selectedDataFilled.filter((d: number) => d > 0).length > 0 ? area($selectedDataFilledTweened) : ""
	
	$: selectedDataLinePath = line($selectedDataFilledTweened)
	
	$: averageWeeklyMax = Math.max(...(averageWeeklyData ?? [0]))
	$: averageDataLinePath = area(
		averageWeeklyData?.map((x: number) => averageWeeklyMax === 0 ? 0 : x / averageWeeklyMax) ?? [0, 0, 0, 0, 0, 0, 0]
	)
	$: averageDataLine = line(
		averageWeeklyData?.map((x: number) => averageWeeklyMax === 0 ? 0 : x / averageWeeklyMax) ?? [0, 0, 0, 0, 0, 0, 0]
	)
	
	let averageWeeklyData: WeeklyData
	
	$: selectedDataIsSet = selectedDataFilled.filter(n => n > 0).length > 0
	
	$: {
		if(selectedDataIsSet) {
			setTimeout(() => {
				
				const weeklyData: WeeklyData[] = featureData?.features.map(getWeeklyDataOfMapFeature) ?? []
				averageWeeklyData = weeklyData?.reduce((acc: number[][], curr: WeeklyData) => {
					

					curr.forEach((val: number, i: number) => {
						acc[i].push(val)
					})
					
					return acc
				}, [[], [], [], [], [], [], []]).map((d: number[]) => {
					return d3.median(d)
				}) as WeeklyData ?? null
			}, 300)
		}
	}


	
	$: colorScaleSelectedData = createColorScale(colors.get("--colorTextDark"), colors.get("--colorAccentPrimary"))
	
	const selectedDataFilledTweened: Tweened<WeeklyData> = tweened([0, 0, 0, 0, 0, 0, 0], {
		duration: 200,
		easing: cubicInOut
	})
	
	$: selectedDataFilledTweened.set(selectedDataFilled.map((x: number) => maxSelectedData === 0 ? 0 : x / maxSelectedData) as WeeklyData)

	const gradientIdentifier = Date.now() * Math.floor(Math.random() * 10)
</script>

<style>
	svg :global(.district) {
		fill: var(--colorAccentPrimaryMuted);
	}
	
	svg :global(.annotation-bottom .annotation-note tspan) {
		text-anchor: middle;
	}
	
	svg .bin {
		/* filter: drop-shadow(0px 1rem 0px rgba(0, 0, 0, 1)); */
	}
	
	svg {
		/* filter: drop-shadow(0px 2px 0px rgba(0, 0, 0, 1)); */
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
		font-size: .7rem;
	}
	
	svg :global(.weekday-background) {
		fill: transparent;
		/* stroke: var(--colorTextMutedDark);
		stroke-width: .5; */
	}
	svg :global(.weekday-select-background) {
		fill: var(--colorAccentPrimary);
	}
	.zero-line {
		stroke: var(--colorAccentPrimaryMuted);
		stroke-width: .5;
		opacity: .3;
	}
</style>

<svg bind:this={svg} pointer-events="all" viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMinYMin meet" on:mousemove={handleMouseMove} on:mouseleave={unhover}>
	
	<g transform="translate(0 {height + margin.verticalMargin - 20})">
		
		{#if maxSelectedData > 0}
		<g transform="translate(0 {-70})">
			<linearGradient id="gradient{gradientIdentifier}" x1="0" x2="0" y1="1" y2="0">
				
				<stop offset="0%" stop-color={colorScaleSelectedData(0)} />
				<stop offset="100%" stop-color={colorScaleSelectedData(1)} />
			</linearGradient>
			
			<linearGradient id="gradient-average{gradientIdentifier}" x1="0" x2="0" y1="1" y2="0">
				
				<stop offset="20%" stop-color="white" stop-opacity="0%"/>
				<stop offset="100%" stop-color="white" />
			</linearGradient>
			
				<g transform="translate({x.bandwidth() / 2} 1)">
					{#if averageWeeklyMax > 0}
						<g transition:fade={{duration:400, delay: 500}} >
							<path d={averageDataLinePath} fill="url(#gradient-average{gradientIdentifier})" opacity={.1} />
							<path d={averageDataLine} class="dataline" fill="none" opacity={.1} />
							
								
								
							<g transform="translate({x.bandwidth() * 6.75} {y(averageWeeklyData.at(-1) / averageWeeklyMax)})">
								<text 
									dominant-baseline="middle" 
									class="weekday"
									text-anchor="start"
									opacity={.3}
								>
									median
								</text>
								
							</g>
						</g>
					{/if}
					<path d={selectedDataPath} fill="url(#gradient{gradientIdentifier})" opacity={.3} />
					<path d={selectedDataLinePath} class="dataline" fill="none" stroke-linecap="round"/>
				</g>
		</g>
		{/if}
		<g transform="translate(0 {-20})" class="weekdays">
			{#each weekdays as weekday, i}
				<g class="weekday-wrapper" transform="translate({x(i)} 0)">
					<text dy={3} dx={x.bandwidth() / 2} class="weekday" text-anchor="middle">
						{weekday}
					</text>
				</g>
			{/each}
			<g transform="translate({width / 2} 20)">
				<text class="axis-label horizontal "
					text-anchor="middle"
				>
					Weekdays
				</text>
			
			</g>
			
			<line 
				class="zero-line"
				y1={-8}
				y2={-8}
				x1={50}
				x2={width - 50}
			/>
			
		</g>
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
				{#key relevantDataShowFeature.name}
				<text class="annotation-note-title" text-anchor="middle">
					<tspan>
						{relevantDataShowFeature.name}
					</tspan>
				</text>
				{/key}
				<g transform="translate(10, 0)">
					<text class="annotation-note-label number" text-anchor="end" dy={20} dx={-5}>
						<tspan>
							<TweenHelper value={relevantDataShowFeature.thefts}/> Thefts
						</tspan>
					</text>
					<text class="annotation-note-label percent" text-anchor="start" dy={20} dx={5}>
						<tspan>
							<TweenHelper value={relevantDataShowFeature.percentage} locale="en" options={{maximumFractionDigits: 2, minimumFractionDigits: 2}} /> %
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
	{#if mapZoomTransform.k < 1.2}
		<text class="infotext" x={width / 2} y={6} text-anchor="middle" transform="">
			Hold ⌥ Option or Alt and Scroll to Zoom or Pan
		</text>
	{/if}
</svg>