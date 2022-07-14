<script lang="ts">
	import type { FittyInstance} from "fitty"
	import fitty from "fitty"
	export let smallTitle: string = undefined
	export let subline: string = undefined
	export let bigNumberExpanderText: string = ""
	export let secondary: boolean = false
	
	
	$: isBigNumberExpanderPresent = bigNumberExpanderText != ""
	
	let bigNumberElement: HTMLElement
	let fitter: FittyInstance
	
	$: if(bigNumberElement) {
		fitter = fitty(bigNumberElement, {
			observeMutations: null,
			maxSize: 50
		})
		fitter.fit()
	}
</script>
	
<style>
	b-small-title {
		font-size: 1.2rem;
		color: var(--colorAccentPrimary);
		font-weight: 500;
		position: relative;
		text-shadow: 0 .05rem 0px black;
	}
	b-big-number {
		/* font-size: 5rem; */
		font-weight: bold;
		/* font-variant-numeric: oldstyle-nums; */
		font-variant-numeric: tabular-nums oldstyle-nums;
		/* background: black; */
		border: .4rem solid;
		border-color: var(--colorTextDark);
		color: var(--colorTextDark);
		background: var(--colorTextPrimary);
		border-radius: 1rem;
		padding: .5rem 1rem;
		text-align: right;
		position: relative;
		overflow: hidden;
	}
	
	b-big-number.secondary {
		border-color: var(--colorTextDarkMuted);
		background: var(--colorBackground);
		color: var(--colorTextPrimary);
		font-weight: 600;
		/* border-width: .3rem; */
		/* padding: .6rem 1.1rem */
	}
	b-big-number.secondary :global(span) {
		font-weight: 300;
	}
	
	b-subline {
		font-size: 1.1rem;
		/* font-variant-numeric: tabular-nums; */
		/* text-transform: uppercase; */
		/* letter-spacing: .2rem; */
		color: var(--colorAccentPrimaryMuted);
	}
	b-wrapper {
		display: flex;
		align-items: flex-end;
		flex-direction: column;
		gap: 1.8rem;
	}
	b-wrapper:not(:first-of-type) {
		margin: .8rem 0 0;
	}
	b-wrapper > * {
		line-height: 1;
	}
	
	b-big-number :global(span) {
		/* opacity: .4; */
		font-variant-caps: all-small-caps;
		font-weight: normal;
	}
	
	.text {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: .4rem;
		padding: 0 .5rem;
	}
</style>

<b-wrapper>
	{#if smallTitle || subline}
	<div class="text">
		{#if smallTitle}
			<b-small-title>
				{smallTitle}
			</b-small-title>
		{/if}
		{#if subline}
			<b-subline>
				{subline}
			</b-subline>
		{/if}
	</div>
	{/if}
	<b-big-number bind:this={bigNumberElement} class:secondary={secondary}>
			<slot></slot>
	</b-big-number>
</b-wrapper>