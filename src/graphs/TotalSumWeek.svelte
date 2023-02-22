<script lang="ts">
	import * as d3 from "d3"
	import TweenHelper from './../helper/TweenHelper.svelte'
	import { cubicOut } from "svelte/easing"
	import { fade } from "svelte/transition";
	import NumberStatement from './NumberStatement.svelte'
	
	export let data: TheftRecord[]
	export let step: number
	
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

	$: newestRecordDate = new Date(d3.max(data, (d: TheftRecord) => Number(d.dateStart)))
	
	$: rollupWeekly = d3.rollups(data,
		(g: TheftRecord[]) => g.reduce((acc: [number, number], record: TheftRecord) => {
			return [
				acc[0] + record.damageAmount,
				acc[1] + 1
			]
		}, [0, 0]),
		(d: TheftRecord) => d3.timeWeek(d.dateStart)
	)
	
	$: zippedWeekly = rollupWeekly.reduce(
	(acc: [number[], number[]], curr: [Date, [number, number]]) => {
		const damage = [...(acc?.at(0) ?? []), curr[1][0]]
		const amount = [...(acc?.at(1) ?? []), curr[1][1]]
		return [damage, amount]
	}, [[],[]])
	
	$: weeklyMedian = zippedWeekly.map((d: number[]) => d3.mean(d))

	$: filteredGroup = rollup.at(d3.maxIndex(rollup, (d: [Date, [number, number]]) => d[0]))
	
	$: weeksRange = [filteredGroup[0], d3.timeMonday.offset(filteredGroup[0])]

	$: todayIsInFilteredGroupWeekRange = Date.now() > weeksRange[0] && Date.now() < weeksRange[1]
	
	$: currentWeekNewestDate = new Intl.DateTimeFormat("en", {
		weekday: "long",
		day: "numeric",
		month: "long"
	}).format(newestRecordDate)
	
	$: currentWeekDate = new Intl.DateTimeFormat("en", {
		weekday: "long",
	}).format(weeksRange[0])
	
	$: damageAmount = filteredGroup[1][0]
	$: theftAmount = filteredGroup[1][1]
</script>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		align-items: flex-end;
		justify-items: flex-end;
		gap: 6rem;
	}
	.set-wrapper {
		display: flex;
		align-items: flex-end;
		gap: 1rem;
	}
</style>
	<div class="wrapper">
		
		<div class="set-wrapper">
			
			<NumberStatement unit="thefts">
				<TweenHelper value={weeklyMedian[1]} tweenOptions={{duration: 500, easing: cubicOut}} startValue={weeklyMedian[1] * .8} options={{maximumFractionDigits: 0}}/>
			</NumberStatement>
			<NumberStatement 
				smallTitle="Weekly Damage"
				subline="Calculation based on {rollupWeekly.length} Weeks"
				unit="euro"
			>
				<TweenHelper value={weeklyMedian[0]} tweenOptions={{duration: 500, easing: cubicOut}} startValue={weeklyMedian[0] * .8} options={{
					maximumFractionDigits: 0,
					maximumSignificantDigits: 3
				}}/>
			</NumberStatement>
		</div>
		
		<div class="set-wrapper">
			
			<NumberStatement unit="thefts" secondary>
				<TweenHelper value={theftAmount} tweenOptions={{duration: 500, easing: cubicOut}} startValue={theftAmount * .8} options={{maximumFractionDigits: 0}}/>
			</NumberStatement>
			<NumberStatement
			secondary
 			smallTitle="{todayIsInFilteredGroupWeekRange ? "Current Week": "Last Week"} Damage"
 			subline="from {currentWeekDate} until {currentWeekNewestDate}"
 			unit="euro"
			>
				<TweenHelper value={damageAmount} tweenOptions={{duration: 500, easing: cubicOut}} startValue={damageAmount * .8} 
				options={{
					maximumFractionDigits: 0,
					maximumSignificantDigits: 3
				}}/>
			</NumberStatement>
		</div>
	</div>
