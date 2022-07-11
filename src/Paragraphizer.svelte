<script lang="ts">
	export let text: string = ""
	
	$: renderedParagrahs = text.split("\n")
	
</script>

<style>

</style>

<div class="wrapper">
	{#each renderedParagrahs as paragraph}
		<p>
			{@html paragraph}
		</p>
	{/each}
</div>