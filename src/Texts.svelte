<script lang="ts">
	import { fly } from "svelte/transition";
	import Paragraphizer from "./Paragraphizer.svelte";
  
	export let index: number;
	export let isScrollDirectionUp: Boolean;
  export let textElements: HTMLDivElement[] = []
	
	const flyDistance: number = 20
	const flyDuration: number = 400
	
	const texts: ([string, string]|string)[] = [
		["Bike Thefts", "Berlin is one of a few german cities maintaining an <a href='https://daten.berlin.de' target='_blank'>online service</a> to provide free and open access to data, gathered by public institutions.\n With their Online Police Department, the Berlin Police is fulfilling the Digitalization Strategy by the government. Citizens are able to report crimes, ask questions or pay their panalties. Since September 2021, the police have been testing a free access to daily updating bicycle theft data of the city – data starting from January 2021."],
    
		"From 2016 to 2021, in the latest crime report, bike thefts declined in average 5.8 % each year in Berlin.\n",
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quam quos tempore reiciendis consectetur alias ratione velit quibusdam magni accusamus enim minus ducimus nostrum provident nihil, molestias ullam mollitia officia?",
	];
	// $: text = texts.at(index) ?? "";
</script>

<div class="wrapper">
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
