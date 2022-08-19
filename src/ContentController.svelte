<script lang="ts">
	import type { SvelteComponent } from "svelte"
	import { Tweened, tweened } from "svelte/motion";
	import { cubicInOut } from "svelte/easing";
	import * as d3 from "d3"
	import Scrolly from './helper/Scrolly.svelte';

	
	import Texts from "./Texts.svelte"
	import Graph from './Graph.svelte'
	
	import TotalSum from './graphs/TotalSum.svelte'
	import HighestDamageMonth from './graphs/HighestDamageMonth.svelte'
	import TotalSumWeek from './graphs/TotalSumWeek.svelte'
	import BikeValueGraph from './graphs/BikeValueGraph.svelte'
	import TimeTheftGraph from './graphs/TimeTheftGraph.svelte'
	import HighestTheftMap from './graphs/HighestTheftMap.svelte'
	import AnnualDistribution from './graphs/AnnualDistribution.svelte'
	import WeeklyTheft from './graphs/WeeklyTheft.svelte'

	
	const storySections: StorySection[] = [
		{
			title: "German Bike Theft City",
			component: TotalSum,
			texts: [{
				text: `
				According to <a href='https://de.statista.com/statistik/daten/studie/165154/umfrage/fahrraddiebstaehle-in-deutschland-2009/' target='_blank'>data</a> from the Bundeskriminalamt (Federal Criminal Police Office) Berlin had the most Bike Thefts in 2021 of all german cities with 25&thinsp;438 thefts reported. \n
				
				The Berlin Police provides an Online Service for citizens, called <em>Internetwache</em>. Citizens are able to report crimes, ask questions or pay their penalties. Since September 2021, the police have been testing a free access to daily updating bicycle theft data of the city; the data starts from January 2021.
				`
			}]
		},
		{
			title: "Weekly Theft in Berlin",
			component: TotalSumWeek,
			texts: [{
				text: ""
			},
			{	
				subtitle: "But what is the mean",
				text: ""
			}]
		},
		{
			title: "Annual Distribution",
			component: AnnualDistribution,
			texts: [
				{
					text: "Thats a very interesting graph. WOW!"
				}
			]
		},
		{
			title: "Test",
			component: HighestDamageMonth,
			texts: [
				{
					text: "What is wrong?"
				}
			]
		},
		{
			component: TimeTheftGraph,
			texts: [
				{
					text: "For each Theft Entry we have the information about a start and end date. I assume that this is associated with the point in time, when the bike was left in the streets, maybe in front of a store and the end date is when the theft was noticed, maybe when the bikes owner returns and can't find the bike."
				},
				{
					text: "In my approach, I spread every theft across the hours in equal sized pieces. For example, <em>Theft A</em> is spread across 10 hours. Each sized one tenth; in sum one."
				},
				{
					text: "Lets add another one. <em>Theft B</em> is spread across 4 hours, so each piece is one fourth big – in sum again one."	
				},
				{
					text: `Now we add another theft, happend at 17 h. Now the thefts overlapp and create a higher peak. \n
					We can now assume, that the most thefts happend at 17:00. \n
					
					The color represents the probability of each item, or in other words how many hours the theft is spread across.
						
					`
				},
				{
					subtitle: "Lets look at all thefts.",
					text: `
						For this visualisation I filtered the data to only show thefts that happened in less than 12 hours to improve the clarity. \n
						The indicator at the bottom shows us when the most thefts happen — that is only an assumption.
					`
				}
			]
		},
		{
			title: "Bike Theft in Berlin",
			component: HighestTheftMap,
			texts: [
				{
					text: "Berlin is one of a few german cities maintaining an <a href='https://daten.berlin.de' target='_blank'>online service</a> to provide free and open access to data, gathered by public institutions.\n With their Online Police Department, the Berlin Police is fulfilling the Digitalization Strategy by the government. Citizens are able to report crimes, ask questions or pay their panalties. Since September 2021, the police have been testing a free access to daily updating bicycle theft data of the city – data starting from January 2021."
				},
				{
					text: "Berlin is one of a few german cities maintaining an <a href='https://daten.berlin.de' target='_blank'>online service</a> to provide free and open access to data, gathered by public institutions.\n With their Online Police Department, the Berlin Police is fulfilling the Digitalization Strategy by the government. Citizens are able to report crimes, ask questions or pay their panalties. Since September 2021, the police have been testing a free access to daily updating bicycle theft data of the city – data starting from January 2021."
				},
				{
					text: "Berlin is one of a few german cities maintaining an <a href='https://daten.berlin.de' target='_blank'>online service</a> to provide free and open access to data, gathered by public institutions.\n With their Online Police Department, the Berlin Police is fulfilling the Digitalization Strategy by the government. Citizens are able to report crimes, ask questions or pay their panalties. Since September 2021, the police have been testing a free access to daily updating bicycle theft data of the city – data starting from January 2021."
				},
			]
		},
		{
			title: "How expensive are stolen bikes?",
			component: BikeValueGraph,
			texts: [
				{
					text: "This graph shows how large the damage of a theft was."
				}
			]
		}
	]
	
	let currentStorySectionGraphComponent: SvelteComponent
	
	$: currentStoryText = currentStorySection.texts.at(currentStoryTextIndex)
	$: currentStorySection = storySections.at(currentStorySectionIndex)
	$: currentStorySectionGraphComponent = currentStorySectionGraphComponent != currentStorySection.component ? currentStorySection.component : currentStorySectionGraphComponent
	$: currentStorySectionTextCount = currentStorySection.texts.length
	
	let currentStoryTextIndex: number
	let currentStorySectionIndex: number

	let textElements: HTMLDivElement[][]
	
	$: {
		const [storySectionIndex, storyTextIndex] = scrollyData?.storySectionId.split("-").map(Number) ?? [null, null]
		
		if(currentStoryTextIndex != storyTextIndex) {
			currentStoryTextIndex = storyTextIndex
		}
		
		if(currentStorySectionIndex != storySectionIndex) {
			currentStorySectionIndex = storySectionIndex
		}
	}
	
	let scrollyVal: number
	let scrollyData: DOMStringMap

	$: gradientIdentifikatior = Math

</script>

<style>
.graphs-wrapper {
	display: flex;
	gap: 1rem;
	/* flex-direction: column; */
	flex: 1 2 50%;
	max-width: 70rem;
	justify-content: center;
	align-items: center;
	position: sticky;
	top: 0;
	height: 100vh;
	box-sizing: border-box;
	padding: 1rem;
}
.text-content-wrapper {
	/* width: var(--body-width); */
	flex: 1 0 var(--body-width);
	
	position: relative;
	padding: 2rem 2rem 0 0;
}
.content-wrapper {
	--padding: 2rem;
	display: flex;
	margin: 0 auto;
	padding: var(--padding);
}
.text-content-wrapper {
	width: calc(100vw - 2.25rem);
}
@media (min-width: 34.375rem) {
	.text-content-wrapper {
		width: min(calc(20.625rem + 33vw), 31rem);
	}
}
@media (min-width: 62.5rem) {
	.text-content-wrapper {
		width: 31rem;
	}
}


</style>
<div class="content-wrapper">
	<div class="text-content-wrapper">
		<Scrolly bind:value={scrollyVal} bind:data={scrollyData}>
			
			<Texts bind:textElements={textElements}
				storySections={storySections} 
				currentStorySectionIndex={currentStorySectionIndex} 
				currentStoryTextIndex={currentStoryTextIndex}
			/>
		</Scrolly>
	</div>
	<div class="graphs-wrapper">
		<Graph component={currentStorySectionGraphComponent} step={currentStoryTextIndex} stepCount={currentStorySectionTextCount}/>
	</div>
</div>
