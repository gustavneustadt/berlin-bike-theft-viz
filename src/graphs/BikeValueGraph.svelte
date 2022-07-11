<script lang="ts">
	import * as d3 from "d3"
	import { Tweened, tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
	export let data: TheftRecord[]
	
	let svg: SVGElement
	
	let tweenedBinHeight: Tweened<number> = tweened(0, {
		duration: 1000,
		easing: cubicOut
	})
	
	tweenedBinHeight.set(1)
	
	const margin = {
		top: 20,
		left: 10,
		right: 20,
		bottom: 20,
		get verticalMargin() {  
			return this.top + this.bottom 
		},
		get horizontalMargin() {
			return this.left + this.right
		}
	}
	
	const width: number = 450 - margin.horizontalMargin
	const height: number = 250 - margin.verticalMargin
	
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
	
	$: binNumber = width / getEvenDivisor(width, 4)
	
	$: thresholdsArray = [...Array(binNumber)].map(
		(_, i: number) => (axisHorizontal.scale().domain()[1] / binNumber) * i
	)
	
	$: bins = d3.bin()
		.value((d: TheftRecord) => d.damageAmount)
		.domain(x.domain())
		.thresholds(thresholdsArray)(data)
	
	const verticalNumberFormatter = new Intl.NumberFormat("fr", {
		useGrouping: true
	})
	
	const horizontalNumberFormatter = new Intl.NumberFormat("fr", {
		style: "currency",
		currency: "EUR",
		maximumFractionDigits: 0,
	})

	const getSpacedSqrtTicks = ([first, second]: [number, number], number: number): number[] => {
		let space = Math.sqrt(second) - Math.sqrt(first)
		const ticks: number[] = []
		for(let i = 0; i < number; i++) {
			ticks.push(
				Math.pow(space, 2) * i
			)
		}
		return ticks
	}
	
	$: console.log(getSpacedSqrtTicks([100, 500], 10))
	
	$: opacityScale = d3.scaleSqrt()
	.domain(yBound)
	.range([0, 1])
	$: axisVertical = d3.axisLeft(y).tickFormat((d: number) => verticalNumberFormatter.format(d)).tickValues([10, 150, 500, 1000, 2000, 4000]).tickSize(width).tickPadding(-width)
	$: axisHorizontal = d3.axisBottom(x).tickFormat((d: number) => horizontalNumberFormatter.format(d)).ticks(5)
	
	// $: [10, 20, 30, 40, 50].forEach(i => console.log(i, Math.sqrt(i), Math.sqrt(i) * Math.sqrt(i)))
	
	
	$: if(svg) {
		context.select("g.axis").append("g").attr("transform", `translate(0, ${height})`).call(axisHorizontal)
		context.select("g.axis").append("g").attr("transform", `translate(${width}, 0)`).call(axisVertical)
			.selectAll(".tick text")
			.attr("transform", "translate(0, -10)")
	}
	
</script>

<style>

</style>


<svg bind:this={svg} viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet">
	<g transform="translate({margin.left}, {margin.top})">
		<g class="axis"></g>
		<g class="bars">
			{#each bins as bin}
			<g transform="translate({x(bin.x0)} {y(bin.length) + (height - y(bin.length)) * (1-$tweenedBinHeight)})">
				<g transform="scale(1 {$tweenedBinHeight})">
					<rect 
						rx="2"
						ry="2"
						class="bin-background"
						x={1}
						height={height - y(bin.length)} 
						width={x(bin.x1 - bin.x0) - 1}
					/>
					<rect 
						rx="2"
						ry="2"
						class="bin"
						x={1}
						height={height - y(bin.length)} 
						width={x(bin.x1 - bin.x0) - 1}
						opacity={opacityScale(bin.length)}
					/>
				</g>
			</g>
			{/each}
		</g>
	</g>
</svg>