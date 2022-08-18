<script lang="ts">
	import * as d3 from "d3"
	import TweenHelper from './../helper/TweenHelper.svelte'
	import { cubicOut } from "svelte/easing"
	import NumberStatement from './NumberStatement.svelte'
	
	export let data: TheftRecord[]

	
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
	
	$: currentWeekDate = new Intl.DateTimeFormat("en", {
		weekday: "long",
		day: "numeric",
		month: "long"
	}).format(weeksRange[0])
	
	$: damageAmount = filteredGroup[1][0]
	$: theftAmount = filteredGroup[1][1]
</script>

<style>

</style>

<NumberStatement
 smallTitle="{todayIsInFilteredGroupWeekRange ? "Current Week": "Last Week"} Damage"
 subline="from {currentWeekDate}"
 unit="euro"
>
	<TweenHelper value={damageAmount} tweenOptions={{duration: 500, easing: cubicOut}} startValue={damageAmount * .8} 
	options={{
		maximumFractionDigits: 0,
		maximumSignificantDigits: 3
	}}/>
</NumberStatement>
<NumberStatement unit="thefts">
	<TweenHelper value={theftAmount} tweenOptions={{duration: 500, easing: cubicOut}} startValue={theftAmount * .8} options={{maximumFractionDigits: 0}}/>
</NumberStatement>