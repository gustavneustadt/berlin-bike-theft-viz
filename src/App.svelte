<script lang="ts">
import { onMount, setContext } from "svelte"
import * as d3 from "d3"
import { readable, Readable } from "svelte/store"

import Scrollama from "scrollama"
import Texts from "./Texts.svelte"
import GraphCollection from './GraphCollection.svelte'

const scroller = Scrollama()
let currentScrollIndex: number
let currentTextId: number
let isScrollDirectionUp: boolean
let graphsElements: HTMLDivElement[]

let data: TheftRecord[]

$: {
	setContext("theftData", data)
}

const url = 'https://corsproxy.io/?' + encodeURIComponent('https://www.internetwache-polizei-berlin.de/vdb/Fahrraddiebstahl.csv');

onMount(async () => {
	await d3.csv(url).then((d: any) => { 
		data = d.map((item: any): TheftRecord => {
			const dateStart = getDateFrom(item.TATZEIT_ANFANG_DATUM, item.TATZEIT_ANFANG_STUNDE)
			const dateEnd = getDateFrom(item.TATZEIT_ENDE_DATUM, item.TATZEIT_ENDE_STUNDE)
			
			const dateRange: TheftRecordProbItem[] = [...d3.timeHour.every(1).range(dateStart, dateEnd), dateEnd].map(
				(d: Date, _, arr: Date[]) => {
					return {
						date: d,
						probScore: 1 / arr.length
					}
				}
			)
			
			return {
				lor: Number(item.LOR),
				bikeType: item.ART_DES_FAHRRADS,
				dateStart: dateStart,
				dateEnd: dateEnd,
				dateDurationHours: dateRange.length,
				burglary: item.DELIKT == "Keller- und Bodeneinbruch",
				damageAmount: Number(item.SCHADENSHOEHE),
				attemptedTheft: item.VERSUCH !== "Nein",
				dateRange: dateRange
			}

		})
	})
  
  scroller
	.setup({
		step: graphsElements,
	})
	.onStepEnter(response => {
		
		
		isScrollDirectionUp = response.direction == "up"
		currentScrollIndex = response.index
		currentTextId = Number(response.element.dataset.textId)
	})
})

function getDateFrom(date: string, hour: string): Date {
	const regex = /(?<day>\d{1,2}).(?<month>\d{1,2}).(?<year>\d{4})/
	const dateGroups = regex.exec(date).groups
	let parsedDate = new Date(Date.parse(`${dateGroups.year}-${dateGroups.month}-${dateGroups.day}T${hour}:00:00`))
	return parsedDate
}


</script>

<style>

.graphs-wrapper {
	display: flex;
	gap: 1rem;
	flex-direction: column;
	scroll-snap-type: y mandatory;
	}
main {
	display: flex;
	align-items: stretch;
	max-width: 80vw;
	margin: 0 auto;
}

main > * {
	flex: 50%;
}

h1 {
	display: flex;
	flex-direction: column;
	line-height: 1.1;
}

h1 > span:first-child {
	font-weight: 500;
}

header {
	max-width: 50vw;
	margin: 0 auto;
	padding: 0 1rem;
}
</style>

{#if data != undefined}
	<header>
		<h1>
			<span>Grand Theft</span>
			<span>Berlin Bikes</span>
		</h1>
	</header>
	<main>
		<div class="text-content-wrapper">
			<Texts index="{currentTextId}" isScrollDirectionUp={isScrollDirectionUp} />
		</div>
		<div class="graphs-wrapper">
			<GraphCollection index={currentScrollIndex} bind:graphsElements={graphsElements} />
		</div>
	</main>
{/if}