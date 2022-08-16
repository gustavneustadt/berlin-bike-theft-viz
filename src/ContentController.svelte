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

	
	const storySections: StorySection[] = [
		{
			title: "When do theft happen?",
			texts: [
				{
					text: `Thats one of the most interesting questions to ask. Can the given dataset tell or recommend us something to prevent theft of our bikes? \n
					Unfortunately the data set does not provide exact information about that and so the answer is hard to answer. Why? Lets have a look on my approach to estimate the time the most bikes are stolen.
					`
				},
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
			title: "When does bike theft happen?",
			component: TotalSum,
			texts: [
				{
					text: "I think, thats one of the most interesting questions I hope to answer. Unfortunately the data set does not provide exact information about that. All what we have is a start date and an end date. The start date might be associated with the point in time, when the bike was left in the streets, maybe in front of a store and the end date is when the theft was noticed, maybe when the bikes owner returns and can't find his bike."
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
			title: "Test",
			component: HighestDamageMonth,
			texts: [
				{
					text: "What is wrong?"
				}
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
		},
		{
			title: "Test",
			component: TotalSumWeek,
			texts: [
				{
					text: "What is wrong?"
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
			title: "Test",
			texts: [
				{
					text: "What is wrong?"
				}
			]
		},
	]
	
	let currentStorySectionGraphComponent: SvelteComponent
	
	$: currentStoryText = currentStorySection.texts.at(currentStoryTextIndex)
	$: currentStorySection = storySections.at(currentStorySectionIndex)
	$: currentStorySectionGraphComponent = currentStorySectionGraphComponent != currentStorySection.component ? currentStorySection.component : currentStorySectionGraphComponent
	$: currentStorySectionTextCount = currentStorySection.texts.length
	
	let currentStoryTextIndex: number
	let currentStorySectionIndex: number

	
	// const scroller = Scrollama()
	let progress: number
	
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
	max-width: 30rem;
	flex: 1 1 50%;
	
	position: relative;
	padding: 2rem 2rem 0 0;
}
</style>

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