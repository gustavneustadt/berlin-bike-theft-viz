<script lang="ts">
	import { fly } from "svelte/transition";
	import Paragraphizer from "./Paragraphizer.svelte";
  
	export let index: number;
	export let isScrollDirectionUp: Boolean;
	export let textElements: HTMLDivElement[][] = []
	
	const flyDistance: number = 20
	const flyDuration: number = 400
	
	const texts: ([string, string]|string)[] = [
		["Bike Thefts", "Berlin is one of a few german cities maintaining an <a href='https://daten.berlin.de' target='_blank'>online service</a> to provide free and open access to data, gathered by public institutions.\n With their Online Police Department, the Berlin Police is fulfilling the Digitalization Strategy by the government. Citizens are able to report crimes, ask questions or pay their panalties. Since September 2021, the police have been testing a free access to daily updating bicycle theft data of the city – data starting from January 2021."],
	
		"From 2016 to 2021, in the latest crime report, bike thefts declined in average 5.8 % each year in Berlin.\n",
	["When does bike theft happen in Berlin?", "I think, thats one of the most interesting questions I hope to answer. Unfortunately the data set does not provide exact information about that. All what we have is a start date and an end date. The start date might be associated with the point in time, when the bike was left in the streets, maybe in front of a store and the end date is when the theft was noticed, maybe when the bikes owner returns and can't find his bike."],
	"one ",
	"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
	"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
	"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
	"Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
	];
  
  const storySections: StorySection[] = [
	{
		title: "When does bike theft happen?",
		texts: [
			{
				text: "I think, thats one of the most interesting questions I hope to answer. Unfortunately the data set does not provide exact information about that. All what we have is a start date and an end date. The start date might be associated with the point in time, when the bike was left in the streets, maybe in front of a store and the end date is when the theft was noticed, maybe when the bikes owner returns and can't find his bike."
			},
			{
				text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?"
			},
			{
				text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?"
			},
			{
				subtitle: "Is this even neccesarry?",
				text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?"
			}
		]
	},
	{
		title: "Bike Theft in Berlin",
		texts: [
			{
				text: "Berlin is one of a few german cities maintaining an <a href='https://daten.berlin.de' target='_blank'>online service</a> to provide free and open access to data, gathered by public institutions.\n With their Online Police Department, the Berlin Police is fulfilling the Digitalization Strategy by the government. Citizens are able to report crimes, ask questions or pay their panalties. Since September 2021, the police have been testing a free access to daily updating bicycle theft data of the city – data starting from January 2021."
			}
		]
	}
  ]
</script>

<!-- <div class="wrapper">
  {#each texts as text, i}
	<div class="text-wrapper" bind:this={textElements[i]} style="opacity: {i === index ? 1 : .2}">
		{#if Array.isArray(text)} 
  		<h3>{text[0]}</h3>
  		<Paragraphizer text={text[1]} />
		{:else}
  		<Paragraphizer {text} />
		{/if}
	</div>
  {/each}
</div> -->

<div class="wrapper">
	{#each storySections as storySection, i}
			{#each storySection.texts as sectionText, j}
				<div class="text-wrapper" bind:this={textElements[i][j]}>
					{#if j === 0}
						<h3>{storySection.title}</h3>
					{/if}
					{#if sectionText.subtitle}
					<h4>
						{sectionText.subtitle}
					</h4>
					{/if}
	    			<Paragraphizer text={sectionText.text} />
				</div>
			{/each}
  {/each}
</div>

<style>
  .wrapper {
	scroll-snap-type: y mandatory;
	position: relative;
	/* top: 2rem; */
	padding: 2rem 2rem 0 0;
	max-width: 30rem;
	line-height: 1.6;
  }
  .text-wrapper {
	scroll-snap-align: start;
	min-height: 90vh;
	transition: opacity .3s ease-in-out;
  }
  
  .text-wrapper :global(a) {
	color: var(--colorAccentPrimaryMuted);
	text-decoration-color: var(--colorTextDarkMuted);
	text-underline-offset: .25rem;
  }
  .text-wrapper :global(a:hover) {
	/* color: var(--colorAccentPrimary); */
	text-decoration-color: var(--colorAccentPrimaryMuted);
  }
</style>
