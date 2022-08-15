<script lang="ts">
	import Paragraphizer from "./Paragraphizer.svelte";
	import * as d3 from "d3"
	
	export let storySections: StorySection[]
	export let textElements: HTMLDivElement[][] = storySections.map(s => [])
	
	export let currentStorySectionIndex: number
	export let currentStoryTextIndex: number
	export let currentStoryTextProgress: number

</script>

<div class="wrapper">
	{#each storySections as storySection, i}
			{#each storySection.texts as sectionText, j}
				<div class="text-wrapper" bind:this={textElements[i][j]} data-story-section-id="{i}-{j}" style="opacity: {currentStoryTextIndex === j && currentStorySectionIndex === i ? 1: .2}">
					{#if j === 0 && storySection.title}
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
	h3 {
		font-size: 1.5rem;
	}
	h4 {
		font-size: 1.5rem;
		color: var(--colorTextMuted);
		font-weight: 400;
	}
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
		min-height: 50vh;
		transition: opacity .3s ease-in-out;
		padding: 0 0 10rem;
		box-sizing: border-box;
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
