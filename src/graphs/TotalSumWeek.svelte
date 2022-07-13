<script lang="ts">
	import * as d3 from "d3"
	import { Tweened, tweened } from "svelte/motion"
	import { cubicOut } from "svelte/easing"
	import NumberStatement from './NumberStatement.svelte'
	
	export let data: TheftRecord[]
	
	$: tweenedValues = tweened(filteredGroup[1].map((d: number) => d / 1.5), {
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
		}, [0, 0]),
		(d: TheftRecord) => d3.timeMonday(d.dateStart)
	)

	$: filteredGroup = rollup.at(d3.maxIndex(rollup, (d: [Date, [number, number]]) => d[0]))
	
	$: weeksRange = [filteredGroup[0], d3.timeMonday.offset(filteredGroup[0])]

	$: todayIsInFilteredGroupWeekRange = Date.now() > weeksRange[0] && Date.now() < weeksRange[1]
	
	$: tweenedValues.set(filteredGroup[1])
	
	const damageAmountString = (number: number = null) => {
		return "~" + new Intl.NumberFormat("en", {
			useGrouping: true,
			maximumFractionDigits: 0,
			maximumSignificantDigits: 3
		}).format((number ? number : filteredGroup[1][0]))
	}
	
	$: bikesAmountString = new Intl.NumberFormat("en", {
		useGrouping: true,
		maximumFractionDigits: 0
	}).format($tweenedValues[1])
	
	$: currentWeekDate = new Intl.DateTimeFormat("en", {
		weekday: "long",
		day: "numeric",
		month: "long"
	}).format(weeksRange[0])
	
	
</script>

<style>

</style>

<NumberStatement
 smallTitle="{todayIsInFilteredGroupWeekRange ? "Current Week": "Last Week"} Damage"
 subline="from {currentWeekDate}"
 bigNumberExpanderText={damageAmountString()}
>
	{damageAmountString($tweenedValues[0])} <span>EUR</span>
</NumberStatement>
<NumberStatement secondary>
	{bikesAmountString} <span>bikes</span>
</NumberStatement>