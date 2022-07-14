<script lang="ts">
	import * as d3 from "d3"
	import { getContext } from "svelte";
	import { Tweened, tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
	import * as d3annotation from "d3-svg-annotation"
	import SvgRect from '../helper/SvgRect.svelte'
	import Annotation from '../helper/Annotation.svelte'
	
	export let data: TheftRecord[]
	
	const { colorScale, remap } = getContext("colors")
	
	let svg: SVGElement
	
	let tweenedBinHeight: Tweened<number> = tweened(0.9, {
		duration: 1000,
		easing: cubicOut
	})
	
	tweenedBinHeight.set(1)
	
	const margin = {
		top: 20,
		left: 10,
		right: 20,
		bottom: 100,
		get verticalMargin() {  
			return this.top + this.bottom 
		},
		get horizontalMargin() {
			return this.left + this.right
		}
	}
	
	const size: [number, number] = [450, 350]
	
	const width: number = size[0] - margin.horizontalMargin
	const height: number = size[1] - margin.verticalMargin
	
	
	$: context = d3.select(svg)
		.select("g")
	
	$: xBound = [
		d3.min(data, (d: TheftRecord) => d.damageAmount),
		d3.max(data, (d: TheftRecord) => d.damageAmount)
	]
	
	$: x = d3.scaleLinear()
		.domain(xBound)
		.rangeRound([0, width])
		.nice()
		
	$: yBound = [
		0,
		d3.max(bins, (g: TheftRecord[]) => g.length)
	]
	
	$: y = d3.scaleSqrt()
		.exponent(.6)
		.domain(yBound)
		.range([height, 0])
	
	const isOdd = (number: number) => number % 4 != 2
	
	const getEvenDivisor = (number: number, start: number) => {
		for(let i = start; i < 200; i++) {
			if(isOdd(number / i)) {
				continue
			}
			return i
		}
	}
	
	$: binNumber = width / getEvenDivisor(width, 10)
	
	$: thresholdsArray = [...Array(binNumber)].map(
		(_, i: number) => (axisHorizontal.scale().domain()[1] / binNumber) * i
	)
	
	$: bins = d3.bin()
		.value((d: TheftRecord) => d.damageAmount)
		.domain(x.domain())
		.thresholds(thresholdsArray)(data)
	
	$: median = d3.median(data, (d: TheftRecord) => d.damageAmount) 
	
	const verticalNumberFormatter = new Intl.NumberFormat("fr", {
	})
	
	const horizontalNumberFormatter = new Intl.NumberFormat("fr", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	})
		
	$: axisVertical = d3.axisLeft(y).tickFormat((d: number) => verticalNumberFormatter.format(d)).ticks(4).tickSize(width).tickPadding(-width)
	$: axisHorizontal = d3.axisBottom(x).tickFormat((d: number) => horizontalNumberFormatter.format(d)).ticks(5)
	
	$: if(svg) {
		context.select("g.axis .horizontal").attr("transform", `translate(0, ${height})`).call(axisHorizontal)
		context.select("g.axis .vertical").attr("transform", `translate(${width}, 0)`).call(axisVertical)
			.selectAll(".tick text")
			.attr("transform", "translate(0, -10)")
	}
	
	
	let mouseEntered = false
	
	$: if(svg) {
		svg.addEventListener("mouseenter", (e: MouseEvent) => {
			mouseEntered = true
		})
		svg.addEventListener("mouseleave", (e: MouseEvent) => {
			mouseEntered = false
		})
		svg.addEventListener("mousemove", (e: MouseEvent) => {
			mouseOffset = [
				(e.offsetX / svgBoundingRect.width) * size[0] - margin.left,
				(e.offsetY / svgBoundingRect.height) * size[1]
			]
		})
	}
	let mouseOffset: [number, number] = [0, 0]
	$: mousePosition = [
		x.clamp(true).invert(mouseOffset[0]),
		y.invert(mouseOffset[1])
	]
	$: mousePositionedBin = bins.findIndex(bin => bin.x0 <= mousePosition[0] && bin.x1 >= mousePosition[0] && bin.length > 0)
	
	let mousePositionBinMiddle: number = 0
	let hoverTextBound: string = ""
	let hoverTextNumber: number = 0
	
	$: if(mousePositionedBin >= 0){
		mousePositionBinMiddle = bins[mousePositionedBin].x0 + (bins[mousePositionedBin].x1 - bins[mousePositionedBin].x0) / 2
		hoverTextBound = `${horizontalNumberFormatter.format(bins[mousePositionedBin].x0)} – ${horizontalNumberFormatter.format(bins[mousePositionedBin].x1)}`
		hoverTextNumber = bins[mousePositionedBin].length
	}
	
	$: svgBoundingRect = svg ? svg.getBoundingClientRect() : null

</script>

<style>
g rect {
	transition: fill .1s ease-in-out;
}
g.hide rect{
	fill: var(--colorTextMutedDark);
}
</style>
<svg bind:this={svg} viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet" pointer-events="all">
	<g class="wrapper" transform="translate({margin.left}, {margin.top})" pointer-events="none">
		<g class="axis">
			<g class="vertical"></g>
			<g class="horizontal" opacity={mouseEntered ? .3 : 1 }></g>
			<text class="axis-label horizontal"
				x={width / 2}
				y={height + 40}
				text-anchor="middle"
				opacity={mouseEntered ? .3 : 1 }
			>
				Damage Amount →
			</text>
			<text class="axis-label vertical"
				x={width}
				text-anchor="end"
			>
				Thefts
			</text>
			
		</g>
		<g class="bars">
			{#each bins as bin, i}
			<g transform="translate({x(bin.x0)} {y(bin.length) + (height - y(bin.length)) * (1-$tweenedBinHeight)})">
				<g transform="scale(1 {$tweenedBinHeight})" class:hide={mouseEntered ? i === mousePositionedBin ? false : true : false }>
					<clipPath id="bin-{i}">
						<SvgRect
							class="bin-background"
							r={[3, 3, 1, 1]}
							height={height - y(bin.length)} 
							width={x(bin.x1 - bin.x0) - 1}
						/>
					</clipPath>
					<rect
						class="bin"
						height={height - y(bin.length)} 
						width={x(bin.x1 - bin.x0) - 1}
						clip-path="url(#bin-{i})"
						style="--color: {colorScale(remap(bin.length, yBound, .4))}"
					/>
				</g>
			</g>
			{/each}
		</g>
		<g class="annotations">
			{#if mouseEntered}
				<Annotation 
					note={
						{
							title: hoverTextBound,
							label: verticalNumberFormatter.format(hoverTextNumber) + " Theft" + (hoverTextNumber > 1 ? "s" : ""),
							align: (x(mousePositionBinMiddle) / width > 0.8 ? "right" : "left"),
							lineType: "none",
							padding: 10
						}
					}
					type={d3annotation.annotationLabel}
					x={x(mousePositionBinMiddle)}
					y={height}
					dy={40}
					dx={0}
					highlight
				/>
			{:else}
				<Annotation 
					note={
						{
							title: "Median Damage",
							label: horizontalNumberFormatter.format(median),
							align: "dynamic",
							lineType: "none",
							padding: 10
						}
					}
					type={d3annotation.annotationLabel}
					x={x(median)}
					y={height}
					dy={40}
					dx={0}
				/>
			{/if}
		</g>
	</g>
</svg>