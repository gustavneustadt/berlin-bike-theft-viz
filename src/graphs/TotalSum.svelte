<script lang="ts">
	import * as d3 from "d3"
	import { Tweened, tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
	import NumberStatement from './NumberStatement.svelte'
	export let data: TheftRecord[]
	
	$: tweenedValues = tweened(rollup.map((d: number) => d / 1.5), {
		duration: 1000,
		easing: cubicOut
	})
	
	$: rollup = d3.rollups(
		data,
		(g: TheftRecord[]) => g.reduce((acc: [number, number], record: TheftRecord) => {
			return [
				acc[0] + record.damageAmount,
				acc[1] + 1
			]
		}, [0, 0])
	)
	
	$: tweenedValues.set(rollup)

	
	
	const damageAmountString = (number: number = null) => {
		return new Intl.NumberFormat("en", {
			useGrouping: true,
			maximumFractionDigits: 2,
			minimumFractionDigits: 2
		}).format((number ? number : rollup[0]) / 1000000) + " mil"
	}
	
	$: bikesAmountString = new Intl.NumberFormat("en", {
		useGrouping: true,
		maximumFractionDigits: 0
	}).format($tweenedValues[1])
	
	$: date = new Intl.DateTimeFormat("en-EN", {
		month: "long",
		year: "numeric"
	}).format(d3.min(data, (d: TheftRecord) => d.dateStart))
	
	function largestNumber(num) {
		num = String(num).split('').sort().reverse().join('');
		return Number(num);
	}
</script>

<style>

</style>

<NumberStatement
	smallTitle="Total Damage"
	subline="since {date}"
>
	{damageAmountString($tweenedValues[0])} <span>EUR</span>
</NumberStatement>
<NumberStatement
	secondary
>
	{bikesAmountString} <span>bikes</span>
</NumberStatement>