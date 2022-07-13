<script lang="ts">
	import * as d3 from "d3"
	import { Tweened ,tweened } from "svelte/motion";
	import { cubicOut } from "svelte/easing";
	import SvgRect from '../helper/SvgRect.svelte'
	
	export let data: TheftRecord[]
	
	let svg: SVGElement
	
	let tweenedBinHeight: Tweened<number> = tweened(0.9, {
		duration: 1000,
		easing: cubicOut
	})
	
	tweenedBinHeight.set(1)
	
	
	const margin = {
		top: 20,
		left: 35,
		right: 0,
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
	
	$: rangedData = data.filter((d: TheftRecord) => d.dateDurationHours < 12).map((d: TheftRecord) => d.dateRange).flat()
	
	$: rolledUp = d3.rollups(
		rangedData,
		g => d3.sum(g, d => d.probScore),
		d => d.date.getHours(),
		d => Math.floor(d.probScore*30) / 30,
	)
	
	$: sumPerBar = rolledUp.reduce((acc, curr) => {
		return [...acc, [curr[0], d3.sum(curr[1], d => d[1])]]
	},[])
	
	$: xBound = [
		0,
		24
	]
	
	$: yBound = [
		0,
		d3.max(sumPerBar, d => d[1])
	]
	
	$: stacked = rolledUp.map(g => [
		g[0],
		stackArray(g[1].sort().reverse(), d => d[1])
	])
	
	const stackArray = (list: any[], callback: (element: any) => number) => {
		const remapped: number[] = list.map(d => callback(d))
		
		const reduced: [number, number][] = remapped.reduce((acc: [number, number], d: number) => {
			const lastVal = acc.at(-1) ?? 0
			const added = lastVal + d
			return [...acc, added]
		}, []).map((d: number, i: number, arr: number[]) => {
			return [arr[i-1] ?? 0, d]
		})
		
		return list.map((d, i) => {
			return [d, reduced[i]]
		})
	}
	
	$: x = d3.scaleLinear()
		.domain(xBound)
		.range([0, width])
		.nice()

	$: y = d3.scaleLinear()
		.domain(yBound)
		.range([height, 0])
		.nice()

	$: axisVertical = d3.axisLeft(y).tickSize(-width + barMargin).tickPadding(5)
	$: axisHorizontal = d3.axisBottom(x).tickValues(d3.range(...xBound)).tickSize(0).tickPadding(10).offset(barWidth / 2)
	
	$: if(svg) {
		context.select("g.axis .horizontal").append("g").attr("transform", `translate(0, ${height})`).call(axisHorizontal)
		context.select("g.axis .vertical").append("g").call(axisVertical)
	}
	
	$: barMargin = 6
	
	$: barWidth = width / stacked.length - barMargin - 1
	
</script>

<style>
.bin-background {
	stroke-width: .5;
	stroke: var(--colorTextMutedDark);
}
</style>


<svg bind:this={svg} viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet">
	<g transform="translate({margin.left}, {margin.top})">
		<g class="bars">
			{#each stacked as stack, j}
				<g
					transform="translate(0 {height * (1-$tweenedBinHeight)})"
				>
					<clipPath id="bin-{j}" transform="translate(0, {y(stack[1].at(-1)[1][1])})" opacity="0.1">
						<SvgRect
							r={[3, 3, 1, 1]}
							height={height - y(stack[1].at(-1)[1][1])}
							width={barWidth}
						/>
					</clipPath>
					<g
						transform="translate({x(stack[0])} {0}) scale(1 {$tweenedBinHeight})"
						clip-path="url(#bin-{j})"
					>
					{#each stack[1] as bin}
						<g
							transform="translate(0 {y(bin[1][0]) - (height - y(bin[0][1]))})"
						>	
							<rect
								class="bin-background"
								height={height - y(bin[0][1])}
								width={barWidth}
							/>
							<rect
								class="bin"
								height={height - y(bin[0][1])}
								width={barWidth}
								opacity={bin[0][0]}
							/>
						</g>
					{/each}			
					</g>
					
				</g>

			{/each}
		</g>
		<g class="axis">
			<g class="vertical">
				
			</g>
			<g class="horizontal" transform="translate(0 0)">
				
			</g>
		</g>
	</g>
</svg>