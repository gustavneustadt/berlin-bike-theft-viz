<script lang="ts">
	import type { FittyInstance} from "fitty"
	import fitty from "fitty"
	export let smallTitle: string = null
	export let subline: string = null
	export let secondary: boolean = false
	export let unit: string = null
	export let comment: string = null
	

	
	let bigNumberElement: HTMLElement
	let fitter: FittyInstance
	
	// $: if(bigNumberElement) {
	// 	fitter = fitty(bigNumberElement, {
	// 		observeMutations: null,
	// 		maxSize: 90
	// 	})
	// 	fitter.fit()
	// }
</script>
	
<style>
	.small-title {
		font-size: 1.3rem;
		color: var(--colorAccentPrimary);
		font-weight: 500;
		position: relative;
		text-shadow: 0 .05rem 0px black;
	}
	.big-number {
		display: flex;
		flex-direction: column;
		font-size: 5rem;
		font-weight: bold;

		font-variant-numeric: tabular-nums oldstyle-nums;
		border: .4rem solid;
		border-color: var(--colorTextDark);
		color: var(--colorTextDark);
		background: var(--colorTextPrimary);
		border-radius: 1.5rem;
		padding: .5rem 1.2rem;
		box-shadow: 0 .5rem var(--colorTextDark);
		text-align: right;
		position: relative;
		overflow: hidden;
	}
	
	.big-number.secondary {
		border-color: var(--colorTextDarkMuted);
		background: var(--colorBackground);
		color: var(--colorTextPrimary);
		font-weight: 600;
	}
	.big-number.secondary .unit {
		font-weight: 300;
	}
	
	.subline {
		font-size: 1.1rem;
		/* font-variant-numeric: tabular-nums; */
		/* text-transform: uppercase; */
		/* letter-spacing: .2rem; */
		color: var(--colorAccentPrimaryMuted);
	}
	.wrapper {
		display: flex;
		align-items: flex-end;
		flex-direction: column;
		gap: 1.8rem;
	}
	.wrapper:not(:first-of-type) {
		margin: .8rem 0 0;
	}
	.wrapper > * {
		line-height: 1;
	}
	
	.text {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: .4rem;
		padding: 0 .5rem;
	}
	.unit {
		font-variant-caps: all-small-caps;
		font-weight: normal;
		font-size: 3rem;
		letter-spacing: .1rem;
		color: var(--colorTextMutedDark);
	}
	.comment {
		color: var(--colorTextMuted);
		font-size: 1rem;
		position: absolute;
		left: 1.5rem;
		bottom: .9rem;
		font-style: italic;
		font-weight: normal;
	}
</style>

<div class="wrapper">
	{#if smallTitle || subline}
	<div class="text">
		{#if smallTitle}
			<div class="small-title">
				{smallTitle}
			</div>
		{/if}
		{#if subline}
			<div class="subline">
				{subline}
			</div>
		{/if}
	</div>
	{/if}
	<div class="big-number" bind:this={bigNumberElement} class:secondary={secondary}>
			<slot></slot>
			{#if unit}
				<div class="unit">
					{unit}
				</div>
			{/if}
			{#if comment}
				<div class="comment">{comment}</div>
			{/if}
	</div>
</div>