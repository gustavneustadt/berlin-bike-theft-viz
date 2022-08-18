<script lang="ts">
	import * as d3 from "d3"
	import { Tweened, tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
	import TweenHelper from './../helper/TweenHelper.svelte'
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
	
	$: damageAmount = rollup[0] ?? 0
	$: theftAmount = rollup[1] ?? 0
	
	const damageAmountFormatter = new Intl.NumberFormat("fr", {
		useGrouping: true,
		maximumFractionDigits: 0,
		maximumSignificantDigits: 4
	})
	
	const bikesAmountFormatter = new Intl.NumberFormat("fr", {
		useGrouping: true,
		maximumFractionDigits: 0
	})
	
	$: date = new Intl.DateTimeFormat("en-EN", {
		month: "long",
		year: "numeric"
	}).format(d3.min(data, (d: TheftRecord) => d.dateStart))
	
</script>

<NumberStatement
	smallTitle="Total Damage"
	subline="since {date}"
	unit="euro"
	comment={damageAmount > 1000000 ? "Yeah, thats Million." : null}
>
	<TweenHelper 
		value={damageAmount} 
		startValue={damageAmount * .8} 
		tweenOptions={{duration: 700, easing: cubicOut}} 
		options={{
			maximumFractionDigits: 0,
			maximumSignificantDigits: 4
		}}
	/>
</NumberStatement>
<NumberStatement
	unit="thefts"
>
	<TweenHelper 
		value={theftAmount} 
		startValue={theftAmount * .8} 
		tweenOptions={{duration: 700, easing: cubicOut}} 
		options={{
			maximumFractionDigits: 0,
		}}
	/>
	
</NumberStatement>