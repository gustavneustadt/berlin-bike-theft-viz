<script lang="ts">
	import * as d3 from "d3"
	import { cubicOut } from "svelte/easing"
	import NumberStatement from './NumberStatement.svelte'
	import TweenHelper from './../helper/TweenHelper.svelte'
	
	export let data: TheftRecord[]
	

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
	
	
	$: damageAmount = highestMonth[1][0]
	$: theftAmount = highestMonth[1][1]

	
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
 unit="euro"
>
	<TweenHelper value={damageAmount} tweenOptions={{duration: 500, easing: cubicOut}} startValue={damageAmount * .8} options={{
		maximumFractionDigits: 0,
		maximumSignificantDigits: 3
	}}/>
</NumberStatement>
<NumberStatement 
unit="thefts"
>
	<TweenHelper value={theftAmount} tweenOptions={{duration: 500, easing: cubicOut}} startValue={theftAmount * .8} options={{maximumFractionDigits: 0}}/>
</NumberStatement>