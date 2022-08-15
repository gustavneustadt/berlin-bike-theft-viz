<script lang="ts">
	import * as d3 from "d3"
	import { getContext } from "svelte"
	import { Tweened ,tweened } from "svelte/motion";
	import { cubicOut, cubicInOut } from "svelte/easing";
	import SvgRect from '../helper/SvgRect.svelte'
	import SvgLine, { LineEnd } from '../helper/SvgLine.svelte'
	import Annotation from '../helper/Annotation.svelte'
	import * as d3annotation from "d3-svg-annotation"

	export let step: number
	
	export let data: TheftRecord[]
	
	const { colorScale, remap } = getContext("colors")
	
	let svg: SVGElement
	
	const resetTween = () => {
		tweenedBinHeight = tweened(0.9, {
			duration: 1000,
			easing: cubicOut
		})
	}
	
	let tweenedBinHeight: Tweened<number>
	
	resetTween()
	
	
	const tweenSteps = new Map([
		[null, [4, 3, 2, 1]],
		[0, [1]],
		[3, [4]],
		[4, [3]]
	])
	
	const zoomProgressTweeningStages = [
		[3, [4]]
	]
	
	let prevStep = null
	
	$: {
		const zoomProgressStage = zoomProgressStages(step)
		const isZoomingStage = zoomProgressTweeningStages.find(d => d[0] === prevStep) as [number, number[]]
		
		if(isZoomingStage) {
			if(isZoomingStage[1].includes(step)) {
				zoomProgress.set(zoomProgressStage)
			}
		} else {
			zoomProgress.set(zoomProgressStage, {duration: 0})
		}
		
		if(tweenSteps.get(prevStep)?.includes(step)) {
			resetTween()
			tweenedBinHeight.set(1)
		}
		prevStep = step
	}
	
	
	
	const margin = {
		top: 30,
		left: 45,
		right: 30,
		bottom: 80,
		get verticalMargin() {  
			return this.top + this.bottom 
		},
		get horizontalMargin() {
			return this.left + this.right
		}
	}
	
	const width: number = 450 - margin.horizontalMargin
	const height: number = 300 - margin.verticalMargin
	
	$: context = d3.select(svg)
		.select("g")
	
	$: rangedData = step > lastExampleStep ? data.filter((d: TheftRecord) => d.dateDurationHours < 12).map((d: TheftRecord) => d.dateRange).flat() : exampleDataSetRecords
	
	$: exampleDataSet = [
		[7, 16],
		[17, 20],
		[17, 17] 
	].slice(0, slicePerStep(step))
	
	const slicePerStep = (step: number) => {
		switch(step) {
			case 3:
				return 3
			case 2:
				return 2
			default: 
				return 1
		}
	}
	
	$: exampleDataSetRecords = exampleDataSet
	.map(([start, end]: [number, number]) => {
		return {
			damageAmount: 0,
			dateStart: new Date(2022, 6, 27, start, 0),
			dateEnd: new Date(2022, 6, 27, end, 0),
			dateDurationHours: 0,
			burglary: false,
			lor: 0,
			bikeType: "",
			dateRange: [],
			attemptedTheft: false
		}
	}).map((d: TheftRecord) => {
		const dateRange: TheftRecordProbItem[] = [...d3.timeHour.every(1).range(d.dateStart, d.dateEnd), d.dateEnd].map(
			(d: Date, _, arr: Date[]) => {
				return {
					date: d,
					probScore: 1 / arr.length
				}
			}
		)
		return dateRange
	}).flat()
	
	const groupCount = 10
	
	$: rolledUp = d3.rollups(
		rangedData,
		g => d3.sum(g, d => d.probScore),
		d => d.date.getHours(),
		d => Math.floor(d.probScore*groupCount) / groupCount,
	)
	
	$: colorScaleGroups = rolledUp.reduce((acc, curr) => {
		const groups = curr[1].map(d => d[0])
		groups.forEach(group => {
			if(!acc.includes(group)) {
				acc.push(group)
			}
		})
		return acc
	}, []).sort().reverse()
	
	$: sumPerBar = rolledUp.reduce((acc, curr) => {
		return [...acc, [curr[0], d3.sum(curr[1], d => d[1])]]
	},[])
	
	
	$: xBound = [...Array(24)].map((_, i: number) => i)
	
	const yBoundSteps = (step) => {
		switch(step) {
			case 0:
			case 1:
			case 2:
			case 3:
				return [0, 2]
			default:
				return [0, d3.max(sumPerBar, d => d[1])]
		}
	}
	
	let yBoundDefined: boolean = false
	
	let yBoundTweened: Tweened<number[]>
	
	const zoomProgressStages = (step: number) => {
		switch(step) {
			case 0:
			case 1:
			case 2:
			case 3:
				return 0
			default:
				return 1
		}
	}

	let zoomProgress: Tweened<number> = tweened(0, {
		duration: 2000,
		easing: cubicInOut
	})
	
	$: if(!yBoundDefined) {
		yBoundTweened = tweened(yBoundSteps(step), {
			duration: 2000,
			easing: cubicInOut
		})
		yBoundDefined = true
	}
	
	$: elBoundy = [0, 2 + d3.max(sumPerBar, d => d[1]) * $zoomProgress]
	
	
	$: yBound = yBoundSteps(step)
	
    let yBoundTweenedTarget = [0, 0]
	
	
	$: if(!yBoundTweenedTarget.equals(yBound)) {
		console.log({yBoundTweenedTarget, yBound}, yBoundTweenedTarget == yBound )
		yBoundTweened.set(yBound)
		yBoundTweenedTarget = yBound
	}
	
	$: stacked = rolledUp.map(g => [
		g[0],
		stackArray(g[1].sort().reverse(), d => d[1])
	])
	
	$: stackedPercentages = stacked.map(
		g => {
			const max = Math.max(...g[1].map(d => d[1][1]))
			
			return g[1].map(d => [d[0], [d[1][0] / max, d[1][1] / max]])
		}
	)
	
	$: maxDataFeature = rolledUp.reduce(
		(acc: [number, number], [hour, values]: [number, [number, number][]]) => {
			const accumulatedVal = values.reduce((acc, [_, val]: [number, number]) => val + acc, 0)
			if(accumulatedVal > acc[1]) {
				return [hour, accumulatedVal]
			} else {
				return acc
			}
		},
		[null, 0]
	)
	
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
	
	const verticalAxisFormatter = (number) => {
		const formattedParts = new Intl.NumberFormat("fr", {
			maximumFractionDigits: 1
		}).formatToParts(number)
		return formattedParts.reduce((acc: string, curr: Intl.NumberFormatPart) => {
			if(curr.type === "decimal") {
				curr.value = "."
			}
			
			return acc + curr.value
		}, "")
	}
	
	$: x = d3.scaleBand()
		.domain(xBound)
		.range([0, width])
		.paddingInner(.25)

	$: y = d3.scaleLinear()
		.domain($yBoundTweened)
		.range([height, 0])

	$: axisVertical = d3.axisLeft(y).tickFormat(d => verticalAxisFormatter(d)).ticks(5).tickSize(-width).tickPadding(5)
	$: axisHorizontal = d3.axisBottom(x).tickSize(0).tickPadding(10)
	
	let axisDrawn: boolean = false
	
	$: if(svg && !axisDrawn) {
		context.select("g.axis .horizontal").append("g").attr("transform", `translate(0, ${height})`).call(axisHorizontal)
		context.select("g.axis .vertical").append("g").call(axisVertical)
		axisDrawn = true
	}
	
	$: if(axisDrawn && svg) {
		context.select("g.axis .vertical g").call(axisVertical)
	}
	
	$: barMargin = 6
	
	$: barWidth = x.bandwidth()	
	
	const exampleTheftNames: string[] = ["A", "B", "C", "D"]
	
	const lastExampleStep = 3
	
	const legendHeight = 100
</script>

<style>

.hidden {
	display: none;
}

.example :global(path.line-end) {
	opacity: .1;
}
.example.label {
	fill: var(--colorAccentPrimaryMuted);
	font-size: .8rem;
	font-variant-caps: all-small-caps;
	letter-spacing: .05rem;
	/* font-style: italic; */
}
:global(.color-scale) {
	
}
</style>


<svg bind:this={svg} viewBox="0 0 {width + margin.horizontalMargin} {height + margin.verticalMargin}" preserveAspectRatio="XMidYMid meet">
	<g transform="translate({margin.left}, {margin.top})">
		<!-- <g>
			<linearGradient id="gradient" x1="0" x2="0" y1="1" y2="0">
				{#each colorScaleGroups as group, i}
					<stop offset="{i/colorScaleGroups.length * 100}%" stop-color={colorScale(group)} />
					<stop offset="{(i+1)/colorScaleGroups.length * 100}%" stop-color={colorScale(group)} />
				{/each}
			</linearGradient>
			<SvgRect width={10} height={legendHeight} x={width + 20} y={height / 2 - legendHeight / 2} r={3} class="color-scale" fill="url(#gradient)"/>
		</g> -->
		<g class="axis">
			<g class="vertical"
				class:hidden={step < 1}>
			</g>
			
			<g class="horizontal">
				
			</g>
			<text class="axis-label horizontal"
				x={width / 2}
				y={step < 1 ? height - 5 : height + 35}
				text-anchor="middle"
			>
				Hours
			</text>
			
			<text class="axis-label vertical"
				class:hidden={step < 1}
				x={-4}
				y={-20}
				text-anchor="end"
			>
				Thefts
			</text>
		</g>
		<g class="bars example" class:hidden={step > lastExampleStep}>
				
				{#each exampleDataSet as line, i}
					{#if i === exampleDataSet.length - 1}
						<g class="example" transform="translate({x(line[0])} 0)">
							<text class="label example"
								x={(x(line[1]) - x(line[0])) / 2 + barWidth / 2}
								y={height + 60}
								text-anchor="middle"
							>
								Theft {exampleTheftNames[i]}
							</text>
							<SvgLine x1={0} y1={height + 45} x2={x(line[1]) - x(line[0]) + barWidth} strokeWidth={1} 
								end={LineEnd.LineOneSide} start={LineEnd.LineOneSide} lineEndHeight={(i === 2 ? -10 : 0) -30}/>
						</g>
					{/if}
				{/each}
		</g>
		
		{#if step > lastExampleStep}
		<Annotation 
			x={x(maxDataFeature[0]) + barWidth / 2}
			y={y(maxDataFeature[1])}
			dx={-x(maxDataFeature[0]) + 100}
			dy={0}
		
			note={{
				title: "Most thefts",
				label: `${verticalAxisFormatter(maxDataFeature[1])}`,
				align: "bottom",
				lineType: "vertical",
				padding: 8
			}}
			type={d3annotation.annotationCallout}
		/>
		{/if}
		
		<g class="bars" class:hidden={step < 1} opacity={step > lastExampleStep ? $zoomProgress : 1}>
			{#each stacked as stack, j}
				<g
					transform="translate(0 {height * (1-$tweenedBinHeight)})"
					opacity={$tweenedBinHeight + .4}
				>
					<g
						transform="translate({x(stack[0])} {0}) scale(1 {$tweenedBinHeight})"
					>
					
						<linearGradient id="gradient-{j}" x1="0" x2="0" y1="1" y2="0">
							{#each stackedPercentages[j] as group, i}
								<stop offset="{group[1][0] * 100}%" stop-color={colorScale(group[0][0])} />
								<stop offset="{group[1][1] * 100}%" stop-color={colorScale(group[0][0])} />
							{/each}
							</linearGradient>
						<SvgRect
							r={[3, 3, 1, 1]}
							height={height - y(stack[1].at(-1)[1][1])}
							yFunc={(_, h) => height - h}
							width={barWidth}
							fill="url(#gradient-{j})"
						/>
					</g>
					
				</g>

			{/each}
		</g>
	</g>
</svg>