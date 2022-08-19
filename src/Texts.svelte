<script lang="ts">
	import Paragraphizer from "./Paragraphizer.svelte";
	import * as d3 from "d3"
	
	export let storySections: StorySection[]
	export let textElements: HTMLDivElement[][] = storySections.map(s => [])
	
	export let currentStorySectionIndex: number
	export let currentStoryTextIndex: number

	const emptyString = (text: string) => text === ""
</script>

{#each storySections as storySection, i}
		{#each storySection.texts as sectionText, j}
			<div 
				class="text-wrapper" 
				class:thin={emptyString(sectionText.text)}
				bind:this={textElements[i][j]} 
				data-story-section-id="{i}-{j}" 
				style="opacity: {currentStoryTextIndex === j && currentStorySectionIndex === i ? 1: .2}"
			>
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


<style>
	h3 {
		font-size: 2rem;
		margin: 0;
		font-weight: 600;
		letter-spacing: .025rem;
		color: var(--colorText);
		position: relative;
		display: inline-block;
		width: auto;
		left: calc(.2rem + .1em);
	}
	
	h3:before, h4:before {
		z-index: -1;
		content: "";
		position: absolute;
		background: var(--colorTextDark);
		left: -1rem;
		width: 100%;
		height: 100%;
		padding: 0 1rem;
	}
	
	h3:before {
		box-shadow: -.1em 0 0 0 var(--colorAccentPrimary);
	}
	
	h4 {
		font-size: 1.5rem;
		color: var(--colorTextMuted);
		font-weight: 400;
		position: relative;
		display: inline-block;
		width: auto;
		left: .2rem;
		margin: .5rem 0 0;
	}
	.text-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		min-height: 100vh;
		transition: opacity .3s ease-in-out;
		padding:5rem 0;
		box-sizing: border-box;
		line-height: 1.6;
	}
	
	@media (max-width: 66.25rem) {
		.text-wrapper {
			justify-content: flex-start;
			min-height: 50vh;
		}
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
