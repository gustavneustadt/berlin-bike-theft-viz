<script context="module" lang="ts">
	export async function preload(page, session) {
		return { foo: "bar" }
	}
</script>

<script lang="ts">
	import * as d3 from "d3"
	import { onMount, getContext } from "svelte"
	import { Tweened, tweened } from "svelte/motion";
	import { cubicOut, cubicInOut } from "svelte/easing";
	import { fade } from "svelte/transition";
	import TweenHelper from './../helper/TweenHelper.svelte'
	import AxisHelper from './../helper/AxisHelper.svelte'
	import SvgLine, { LineEnd } from './../helper/SvgLine.svelte'
	import { clamp } from './../helper/Functions.svelte'
	
	const { remap, colorScale, createColorScale, colors } = getContext("colors")
	export let data: TheftRecord[]
	
	let svg: SVGGraphicsElement
	
	const margin = {
		top: 10,
		left: 60,
		right: 50,
		bottom: 40,
		get verticalMargin() {  
			return this.top + this.bottom 
		},
		get horizontalMargin() {
			return this.left + this.right
		}
	}
	
	const width: number = 450 - margin.horizontalMargin
	const height: number = 200 - margin.verticalMargin
	
	
	const x = d3.scaleLinear()
		.domain([0, 11])
		.range([0, width])
		
	
	$: y = d3.scaleLinear()
		.domain([0, maxMonth])
		.range([height, 0])
	
	type MonthRecord = [number, number]
	
	$: maxMonth = Math.max(...bins.map(([_, amount]: MonthRecord) => amount), ...binsCurrentYear.map(([_, amount]: MonthRecord) => amount))
	
	const binData = (data: TheftRecord[]): MonthRecord[] => {
		
		const countMonths = (data: TheftRecord[]): MonthRecord[] => d3.rollups(
			data,
			(g: TheftRecord[]) => g.length,
			(d: TheftRecord) => d.dateStart.getMonth()
		).sort((a: MonthRecord, b: MonthRecord) => a[0] - b[0]) as MonthRecord[]
		
		const groupedByYear: [number, TheftRecord[]][] = d3.groups(data, (d: TheftRecord) => d.dateStart.getFullYear())
		
		const summedMonthsByYear: MonthRecord[][] = groupedByYear.map(
			([_, yearTheft]: [number, TheftRecord[]]) => countMonths(yearTheft)
		)

		if(summedMonthsByYear.length === 1) {
			return summedMonthsByYear.at(0)
		}
		
		const monthGroupedOverYears: number[][] = summedMonthsByYear.reduce(
			(acc: number[][], currYear: MonthRecord[]) => {
				currYear.forEach(([monthIndex, amount]: MonthRecord) => {
					if(!acc[monthIndex]) {
						acc[monthIndex] = [amount]
						return
					}
					acc[monthIndex].push(amount)
				})
				return acc
			}, []
		)
		
		const medianPerMonthCalculated: MonthRecord[] = monthGroupedOverYears.map((month: number[], index: number) => [index, d3.median(month)])

		return medianPerMonthCalculated
	}
	
	const currentDate: Date = new Date()
	
	const datesAreSameMonth = (a: Date, b: Date): boolean => {
		return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()
	}
	
	const getDataForYear = (year: number, data: TheftRecord[]): TheftRecord[] => {
		return data.filter((d: TheftRecord) => d.dateStart.getFullYear() === year && filterCurrentMonth(d))
	}
	
	const filterCurrentMonth = (d: TheftRecord) => !datesAreSameMonth(currentDate, d.dateStart)
	
	$: bins = binData(data.filter((d: TheftRecord) => !datesAreSameMonth(currentDate, d.dateStart)))
	
	$: currentYearData = getDataForYear(currentDate.getFullYear(), data)
	
	$: binsCurrentYear = binData(
		currentYearData.length < 1 ? getDataForYear(currentDate.getFullYear() - 1, data) : currentYearData
	).map(([i, d]: MonthRecord) => [i, d * $appearTween] as MonthRecord)
	
	// $: currentOverallPercentage = binsCurrentYear.reduce(([month, amount]: MonthRecord) => {
	// 	return [month, amount + bins[month][1]]
	// })
	
	$: currentOverallPercentage = (binsCurrentYear.reduce((acc: number, [_, curr]: MonthRecord) => {
		return acc + curr
	}, 0) / binsCurrentYear.reduce((acc: number, [month, _]: MonthRecord) => {
		return acc + bins[month][1]
	}, 0) - 1) * 100
	
	$: medianCurrentX = d3.mean(binsCurrentYear.map(([monthIndex, _]: MonthRecord) => monthIndex))
	
	const horizontalAxisFormatter = (monthIndex: number) => {
		const date = new Date
		date.setMonth(monthIndex)
		const formatter = new Intl.DateTimeFormat("en", {
			month: "short"
		})
		
		return formatter.format(date)
	}
	
	const verticalAxisFormatter = new Intl.NumberFormat("fr", {
		maximumFractionDigits: 0
	})
	
	$: axisHorizontal = d3.axisBottom(x).tickFormat((monthIndex: number) => horizontalAxisFormatter(monthIndex)).ticks(12).tickPadding(5).tickSizeInner(height + 5)
	
	$: axisVertical = d3.axisLeft(y).tickFormat((theftsAmount: number) => verticalAxisFormatter.format(theftsAmount)).ticks(5).tickPadding(5).tickSizeInner(-width - 5)
	
	$: colorScaleSelectedData = createColorScale(colors.get("--colorTextDark"), colors.get("--colorAccentPrimary"))
	
	$: lineGenerator = d3.line()
		.curve(d3.curveMonotoneX)
		.x(([monthIndex, _]: MonthRecord) => x(monthIndex))
		.y(([_, amount]: MonthRecord) => y(amount))
		
	$: areaGenerator = d3.area()
		.curve(d3.curveMonotoneX)
		.x(([monthIndex, _]: MonthRecord) => x(monthIndex))
		.y1(([_, amount]: MonthRecord) => y(amount))
		.y0(_ => y(0))
	
	$: dataLinePath = lineGenerator(binsCurrentYear)
	$: dataLinePathArea = areaGenerator(binsCurrentYear)
	
	$: medianDataLinePath = lineGenerator(bins)
	$: medianDataLinePathArea = areaGenerator(bins)
	
	const getLabelPosition = (bins: MonthRecord[]) => {
		return {
			x: x(bins.at(-1)[0]),
			y: y(bins.at(-1)[1])
		}
	}
	
	$: currentLineLabelPosition = getLabelPosition(binsCurrentYear)
	$: medianLineLabelPosition = getLabelPosition(bins)
	
	const gradientIdentifier = Date.now() * Math.floor(Math.random() * 10)
	
	const appearTween: Tweened<number> = tweened(0.9, {
		duration: 300,
		easing: cubicOut,
		delay: 200
	})
	
	appearTween.set(1)
	let hover = false
	
	const handleMouseMove = (e: MouseEvent) => {
		const pos = getMousePosition(e)
		if(
			pos.x < margin.left ||
			pos.x > margin.left + width
		) {
			hover = false
			return
		}
		
		const clampedPos = {
			x: clamp(pos.x, margin.left, margin.left + width) - margin.left,
			y: clamp(pos.y, margin.top, margin.left + height) - margin.top
		}
		hover = true
		hoverLineXPos = Math.round(x.invert(clampedPos.x))
	}
	
	function getMousePosition(e: MouseEvent) {
	  var CTM = svg.getScreenCTM();
	  return {
		x: (e.clientX - CTM.e) / CTM.a,
		y: (e.clientY - CTM.f) / CTM.d
	  };
	}
	
	let hoverLineXPos = 0
	
	const hoverLineXPosTweened: Tweened<number> = tweened(0, {
		duration: 100,
		easing: cubicInOut
	})
	
	$: hoverLineXPosTweened.set(hoverLineXPos)
	
	
	$: hoverCircleY = {
		median: bins?.at(hoverLineXPos)?.at(1) ?? null,
		current: binsCurrentYear?.at(hoverLineXPos)?.at(1) ?? null,
		get medianOffset() {
			if(!this.current) {
				return 0
			}
			
			const diff = Math.abs(y(this.current) - y(this.median))
			
			if(this.current > this.median) {
				return diff < 10 ? 10 : 0
			}
			
			if(this.current <= this.median) {
				return diff < 10 ? -10 : 0
			}
		}
	}
	
	const hoverCircleYTweened: Tweened<[number, number, number]> = tweened([0, 0, 0], {
		duration: 200,
		easing: cubicInOut
	})
	
	$: hoverCircleYTweened.set([
		hoverCircleY.median ?? 0, 
		hoverCircleY.current ?? hoverCircleY.median,
		hoverCircleY.medianOffset
	])
	
	const percentageFormatter = new Intl.NumberFormat("en", {
		maximumFractionDigits: 2,
	})
	
	$: percentageDifference = hoverCircleY.current ? (hoverCircleY.current / hoverCircleY.median - 1) * 100 : 0
	
</script>

<style>
	svg :global(.horizontal .tick line) {
		opacity: .1 !important;
	}
	
	.axis-label.current-year {
		fill: var(--colorAccentPrimary) !important;
	}
	
	.circle-hover {
		fill: var(--colorAccentPrimary);
	}
	.line-hover {
		stroke: var(--colorAccentPrimary);
		opacity: .3;
		stroke-width: 1;
	}
	.axis :global(.vertical text), .axis :global(.vertical line), .dataline.primary {
		transition: opacity .3s ease-in-out;
	}
	
	.hovering .axis :global(.vertical text) {
		opacity: .1;
	}
	
	.hovering .dataline.primary {
		opacity: .3;
	}
	
	
	.hovering .axis :global(.vertical line) {
		opacity: 0;
	}
	
	
	.text-hover {
		font-size: .7rem;
		font-variant-numeric: tabular-nums;
		letter-spacing: .025rem;
		alignment-baseline: middle;
		font-weight: 400;
		fill: var(--colorTextPrimary)
	}
	
	.percentage-hover {
		color: var(--colorAccentPrimaryMuted);
	}
	
	.percentage-text {
		font-size: .7rem;
		font-variant-numeric: tabular-nums;
		letter-spacing: .025rem;
		font-weight: 300;
		fill: var(--colorTextMuted);
		vertical-align: middle;
	}
	.big-percentage {
		font-variant-numeric: tabular-nums;
		fill: var(--colorAccentPrimaryMuted);
	}
</style>

<svg bind:this={svg} pointer-events="all" viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet" on:mousemove={handleMouseMove} on:mouseleave={() => hover = false}
class:hovering={hover}
>
	<g transform="translate({margin.left} {margin.top})">
		
		<g class="axis">
			<g transform="translate({-axisVertical.tickPadding()} 0)">
				<AxisHelper axis={axisVertical} class="vertical"/>
				<text class="axis-label" text-anchor="end" dx={-axisVertical.tickPadding()}>
					Thefts
				</text>
				
			</g>
			<AxisHelper transform="translate(0 {0})" axis={axisHorizontal} class="horizontal"/>
			<text class="axis-label" text-anchor="middle" dx={width / 2} dy={height + 25} dominant-baseline="hanging">
				Months
			</text>
		</g>
		
		<linearGradient id="primary-area-gradient{gradientIdentifier}" x1="0" x2="0" y1="1" y2="0">
			<stop offset="0%" stop-color={colorScaleSelectedData(0)} />
			<stop offset="100%" stop-color={colorScaleSelectedData(1)} />
		</linearGradient>
		
		<linearGradient id="secondary-area-gradient{gradientIdentifier}" x1="0" x2="0" y1="1" y2="0">
			<stop offset="20%" stop-color="white" stop-opacity="0%"/>
			<stop offset="100%" stop-color="white" />
		</linearGradient>
		
			<g in:fade={{delay: 400, duration: 200}}>
				<path d={medianDataLinePathArea} fill="url(#secondary-area-gradient{gradientIdentifier})" opacity={.1} />
				<path d={medianDataLinePath} class="dataline" opacity={.1}/>
					
				{#if x(hoverLineXPos) !== medianLineLabelPosition.x || !hover}
					<text class="axis-label" 
					transition:fade={{duration: 100}}
					dy={medianLineLabelPosition.y} 
					dx={medianLineLabelPosition.x + 5} 
					dominant-baseline="middle" opacity={.5}>
						Median
					</text>
				{/if}
			</g>
		
			
		<path d={dataLinePathArea} fill="url(#primary-area-gradient{gradientIdentifier})" opacity={.3} />
		<path d={dataLinePath} class="dataline primary"/>
		
		{#if x(hoverLineXPos) !== currentLineLabelPosition.x || !hover}
			<text 
				transition:fade={{duration:100}}
				class="axis-label current-year" 
				dy={currentLineLabelPosition.y}  
				dx={currentLineLabelPosition.x + 5} 
				dominant-baseline="middle"
			>
				{currentYearData.length < 1 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()}
			</text>
		{/if}
		
		
		{#if hover}
			<rect
				transition:fade={{duration:100}}
				x={x($hoverLineXPosTweened) - .25}
				y={y(
					Math.min($hoverCircleYTweened.at(0), $hoverCircleYTweened.at(1))
				)}
				height={height + 5 - y(Math.min($hoverCircleYTweened.at(0), $hoverCircleYTweened.at(1)))}
				width={.5}
				class="line-hover"
			/>
			{#if hoverCircleY.median}
					<g 
						transform="translate({x($hoverLineXPosTweened)} {y($hoverCircleYTweened.at(0))})"
						transition:fade={{duration: 100, easing: cubicOut}}
					>
						<circle 
							r={2} 
							class="circle-hover"
						/>
						<text 
							class="text-hover"
							dx={5}
							dy={$hoverCircleYTweened.at(2)}
						>
							<TweenHelper 
								tweenOptions={{duration:200}}
								value={hoverCircleY.median} 
								formatter={verticalAxisFormatter}
							/> 
						</text>
						
					</g>
			{/if}
			
			{#if hoverCircleY.current}
				
					<g 
						transform="translate({x($hoverLineXPosTweened)} {y($hoverCircleYTweened.at(1))})"
						transition:fade={{duration: 100, easing: cubicOut}}
					>
						<circle 
							r={2} 
							class="circle-hover"
						/>
						<text 
							class="text-hover"
							dx={5}
						>
							<TweenHelper 
								tweenOptions={{duration:200}}
								value={hoverCircleY.current} 
								formatter={verticalAxisFormatter}
							/> 
						</text>
					</g>
				
			{/if}
				<g 
					class="percentage-hover"
					transform="translate({x($hoverLineXPosTweened)-10} 0)"
					transition:fade={{duration: 100}}
				>
				{#if Math.abs(percentageDifference) > 0.2}
					<SvgLine 
						x1={0} 
						y1={y(Math.min($hoverCircleYTweened.at(0), $hoverCircleYTweened.at(1)))} 
						y2={y(Math.max($hoverCircleYTweened.at(0), $hoverCircleYTweened.at(1)))} 
						strokeWidth={.5}
						lineEndHeight={10}
						end={LineEnd.LineOneSide}
						start={LineEnd.LineOneSide}
					/>
				{/if}	
					
					<text 
						class="percentage-text"
						dy={y($hoverCircleYTweened.at(0)) + (y($hoverCircleYTweened.at(1)) - y($hoverCircleYTweened.at(0))) / 2 + .4} 
						dx={-5}
						text-anchor="end"
						dominant-baseline="middle"
					>
						{percentageDifference > 0 ? "+" : percentageDifference < 0 ? "–" : ""} <TweenHelper 
							tweenOptions={{duration:200}}
							value={Math.abs(percentageDifference)} 
							formatter={percentageFormatter}
						/> %
					</text>
				</g>
			
		{:else}
			<text 
				dy={height / 3 * 2}
				dx={x(medianCurrentX)}
				text-anchor="middle" 
				class="big-percentage" 
				transition:fade={{duration:200, delay:50}}
			>
				{currentOverallPercentage > 0 ? "+" : null}{percentageFormatter.format(currentOverallPercentage)} %
			</text>
		{/if}
		
		
	</g>
</svg>
