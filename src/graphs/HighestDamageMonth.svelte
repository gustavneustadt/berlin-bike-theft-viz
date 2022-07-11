<script lang="ts">
	import * as d3 from "d3"
	import { Tweened, tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
	import NumberStatement from './NumberStatement.svelte'
	export let data: TheftRecord[]
	export let width: number
	
	const tweenedValues: Tweened<[number, number]> = tweened([0, 0], {
		duration: 1000,
		easing: cubicOut
	})
	
	$: rollup = d3.rollups(
		data,
		// (g: TheftRecord[]) => d3.sum(g, (d: TheftRecord) => d.damageAmount),
		(g: TheftRecord[]) => g.reduce((acc: [number, number], record: TheftRecord) => {
			return [
				acc[0] + record.damageAmount,
				acc[1] + 1
			]
		}, [0, 0]),
		(d: TheftRecord) => d3.timeMonth(d.dateStart)
	)
	
	$: highestMonth = rollup.at(d3.maxIndex(rollup, (d: [Date, [number, number]]) => d[1][0]))
	
	$: tweenedValues.set(highestMonth[1])
	
	const damageAmountString = (number: number = null) => {
		return new Intl.NumberFormat("en", {
			useGrouping: true,
			maximumFractionDigits: 2,
			minimumFractionDigits: 2
		}).format((number ? number : highestMonth[1][0]) / 1000000) + " mil"
	}
	
	$: bikesAmountString = new Intl.NumberFormat("en", {
		useGrouping: true,
		maximumFractionDigits: 0
	}).format($tweenedValues[1])
	
	$: month = new Intl.DateTimeFormat("en-EN", {
		month: "long",
		year: "numeric"
	}).format(highestMonth[0])
	
</script>

<style>

</style>

<NumberStatement
 smallTitle="Highest Damage Month"
 subline={month}
>
	{damageAmountString($tweenedValues[0])} <span>EUR</span>
</NumberStatement>
<NumberStatement 
secondary>
	{bikesAmountString} <span>bikes</span>
</NumberStatement>