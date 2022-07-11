<script lang="ts">
	import { fly } from "svelte/transition";
	import Paragraphizer from "./Paragraphizer.svelte";
	export let index: number;
	export let isScrollDirectionUp: Boolean;
	
	const flyDistance: number = 20
	const flyDuration: number = 400
	
	$: texts = [
		"In the recent years, Open Data and E-Government is becoming more and more important to the german government. Berlin is one of a few german cities maintaining an online service to provide free and open access to data, gathered by public institutions.\n With their Online Police Department, the Berlin Police is fulfilling the Digitalization Strategy by the government. Citizens are able to report crimes, ask questions or pay their panalties. Since September 2021, the police have been testing a free access to daily updating bicycle theft data of the city – the oldest data is from January 2021.",
    
		"From 2016 to 2021, in the latest crime report, bike thefts declined in average 5.8 % each year in Berlin.\n",
    ""
	];
	$: text = texts.at(index) ?? "";
</script>

<div class="wrapper">
  {#key index}
    <div
      class="hiding-wrapper"
      in:fly={{ y: isScrollDirectionUp ? -flyDistance : flyDistance, duration: flyDuration }}
      out:fly={{ y: isScrollDirectionUp ? flyDistance/2 : -flyDistance/2, duration: flyDuration/2 }}
    >
      <Paragraphizer {text} />
    </div>
  {/key}
</div>

<style>
  .wrapper {
    position: sticky;
    top: 2rem;
    padding: 2rem 2rem 0 0;
    max-width: 30rem;
    line-height: 1.6;
  }
  .hiding-wrapper {
    position: absolute;
  }
</style>
