<script lang="ts">
	import { onMount, setContext, getContext } from "svelte"
	import Scrollama from "scrollama"
	
	import Texts from "./Texts.svelte"
	import GraphCollection from './GraphCollection.svelte'
	
	
	const scroller = Scrollama()
	let progress: number
	
	let textElements: HTMLDivElement[] = []
	
	$: if(textElements) { scroller
		.setup({
			step: textElements,
			progress: true
		})
		.onStepEnter(response => {
			// console.log(response)
			// isScrollDirectionUp = response.direction == "up"
			// currentScrollIndex = response.index
			// currentTextId = Number(response.element.dataset.textId)
		})
		.onStepProgress(response => {
			progress = response.progress
		})
		.resize()
	}

	let test =
</script>

<style>

</style>

<div class="text-content-wrapper">
	<Texts bind:textElements={textElements} bind:currentTextElement={currentTextElement} />
</div>
<div class="graphs-wrapper">
	<GraphCollection component={}/>
</div>