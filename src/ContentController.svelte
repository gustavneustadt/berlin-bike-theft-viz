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
				subtitle: "Berlin (and Leipzig)",
				text: `
				According to <a href='https://de.statista.com/statistik/daten/studie/570624/umfrage/fahrraddiebstaehle-und-aufgeklaerte-faelle-in-deutschen-staedten/' target='_blank'>data</a> from the Bundeskriminalamt (Federal Criminal Police Office) Berlin had the most Bike Thefts in 2021 of all german cities with 25&thinsp;438 thefts reported. But Leipzig had reported the most <a href="https://de.statista.com/statistik/daten/studie/165154/umfrage/fahrraddiebstaehle-in-deutschland-2009/">Bike Thefts relative to the population</a>; Berlin only takes the 16th place in this regard.\n
				
				The Berlin Police provides an Online Service for citizens: the <em>Internetwache</em>. Citizens are able to report crimes, ask questions or pay their penalties. Since September 2021, the police have been testing a free and open access to daily updating bicycle theft data of the city, starting from January 2021. \n
				
				This Visualisation Project uses this data provided by the Berlin Police Department and shows you some insights into it. The police publishes new data every day at 12:00 am.
				`
			}]
		},
		{
			title: "Weekly Bike Theft in Berlin",
			component: TotalSumWeek,
			texts: [
			{	
				text: `The Berlin Police solved 4.6 % of 25&thinsp;438 reported bike theft cases in 2021 (<a href="https://www.berlin.de/polizei/_assets/verschiedenes/pks/pks-kurzbericht-2021.pdf" target="_blank">Latest Crime Report</a>, Page 23). That means only 18 out of 400 theft cases get solved.\n
				
				This data shows you the mean damage per week in terms of money and amount of thefts in berlin at the top and the data of the current week at the bottom. Because new data gets published every day at 12 am, the graph may show you the data from last week.\n
				`
			}]
		},
		{
			title: "Bike Theft Season",
			component: AnnualDistribution,
			texts: [
				{
					subtitle: "Is there a bike season?",
					text: `The data shows that in the summer months more bikes get stolen; but thats obvious anyways I think. In my perspective most people use their bikes in summer months to commute to work or for other mid to long range  distances.\n
					
					You can hover with your mouse or click on the graph to get information about the current year monthly thefts relative to the monthly mean.`
				}
			]
		},
		{
			title: "Highest Financial Damage Month",
			component: HighestDamageMonth,
			texts: [
				{
					text: "Usually the most thefts happen in the summer when many poeple are using their bikes; as showed in the last diagram. This numbers shows you the month with the highest <em>financial</em> damage."
				}
			]
		},
		{
			component: TimeTheftGraph,
			title: "When do thefts happen?",
			texts: [
				{
					text: `For each bike theft report we have the information about a start and end date. I assume that this is associated with the point in time, when the bike was left in the streets, maybe in front of a store and the end date is when the theft was noticed, maybe when the bikes owner returns and can't find the bike.\n
					
					But how do we calculate the point in time when the thieves steal our loved bikes?\n
					`
				},
				{
					subtitle: "An calculation approach",
					text: "In my approach, I spread every theft across the hours in equal sized pieces. For example, <em>Theft A</em> is spread across 10 hours. Each sized one tenth; in sum one."
				},
				{
					text: "Lets add another one. <em>Theft B</em> is spread across 4 hours, so each piece is one fourth big – in sum again one."	
				},
				{
					subtitle: "The Peak",
					text: `Now we add another theft, happend at 16:00 and noticed at 17:00. Now the thefts overlapp and create a higher peak. \n
					We can now assume, that the most thefts happend at 17:00. \n
					
					The color only shows the different groups of items. Items with a higher probability gets a more vibrant yellow. This gets clearer when we take a look on all reported thefts …
					`
				},
				{
					subtitle: "Lets look at all thefts.",
					text: `
						For this visualisation I filtered the data to only show thefts that happened in less than 12 hours to improve the clarity. \n
						The indicator shows us, when the most thefts happened; following my calculations. \n
						
						At the moment, the dataset contains only data of 2021 and 2022. That means, that this graph might be not as precise — it might be a good idea to give it another look in one or two years. ;-)
					`
				}
			]
		},
		{
			title: "District of Bike Crime",
			component: HighestTheftMap,
			texts: [
				{
					text: `The map shows you where to not leave your bike unattended. Doesn't it?\n
					
					I found no dataset about the population and traffic density for each district, so it is hard to tell which district is a bike thief's paradise.\n
					
					The additional diagram at the bottom gives you the individual theft fingerprint of the selected berlin city district.\n
					`
				}
			]
		},
		{
			title: "How expensive are stolen bikes?",
			component: BikeValueGraph,
			texts: [
				{
					text: `This graph shows how expensive stolen bikes usually are. Unfortunately this graph doesn't really tell much about thieves stealing behavior or preference for expensive bikes because this graph may just represent the value of bikes common in berlin.\n
					
					This assumption is supported by a <a href="https://de.statista.com/infografik/13617/fahrradpreise-in-der-eu/" target="_blank">statistic by CONEBI (article by statista)</a> which shows that the average bike price in 2016 was 643 Euros which is really close to the mean value the theft data.`
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
	
	$: currentTextIsEmpty = currentStoryText.text === ""

</script>

<style>
.graphs-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	height: var(--graph-height);
	left: var(--graph-left);
	right: var(--graph-right);
	/* top: 0; */
	bottom: 0;
	box-sizing: border-box;
	/* transition: left 3s ease-in-out; */
	z-index: 10;
	background: var(--colorBackground)
}

.content-wrapper {
	--padding: 4rem;
	margin: 0 auto;
	padding: var(--padding);
	position: relative;
}

.text-content-wrapper {
	position: relative;
	
	width: var(--text-width)
}
.content-wrapper {
	--graph-height: 100vh;
	--graph-left: calc(var(--text-width) + var(--padding) + 1rem);
	--graph-right: var(--padding);
	--text-width: calc(100vw - 2.25rem);
}
@media (max-width: 66.25rem) {
	.graphs-wrapper {
		border-top: .5px solid var(--colorTextMuted);
		overflow: auto;
	}
	
	.content-wrapper {
		--graph-left: 0;
		--graph-right: 0;
		--graph-height: 50vh;
		--padding: min(2vw, 1rem);
	}
}

@media (min-width: 34.375rem) {
	.content-wrapper {
		--text-width: min(calc(20.625rem + 33vw), 31rem);
	}
}
@media (min-width: 62.5rem) {
	.content-wrapper {
		--text-width: 31rem;
	}
}



</style>
<div class="content-wrapper">
	<div class="graphs-wrapper"
		class:fullscreen={currentTextIsEmpty}
	>
		<Graph component={currentStorySectionGraphComponent} step={currentStoryTextIndex} stepCount={currentStorySectionTextCount}/>
	</div>
	<div class="text-content-wrapper">
		<Scrolly bind:value={scrollyVal} bind:data={scrollyData}>
			
			<Texts 
				bind:textElements={textElements}
				storySections={storySections} 
				currentStorySectionIndex={currentStorySectionIndex} 
				currentStoryTextIndex={currentStoryTextIndex}
			/>
		</Scrolly>
	</div>
</div>
