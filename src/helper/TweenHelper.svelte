<script lang="ts">
	import { Tweened, tweened } from "svelte/motion"
	import { cubicInOut } from "svelte/easing"
	export let tween: Tweened<number> = null
	export let options: Intl.NumberFormatOptions = null
	export let locale: string | string[] = null
	export let formatter: Intl.NumberFormat = null
	export let startValue: number = null
	
	interface TweenOptions<T> {
		delay?: number;
		duration?: number | ((from: T, to: T) => number);
		easing?: (t: number) => number;
		interpolate?: (a: T, b: T) => (t: number) => T;
	}
	
	export let tweenOptions: TweenOptions<number> = null
	export let value: number = 0
	
	$: if(tween === null) {
		tween = tween ?? tweened(startValue ?? value, tweenOptions ?? {
			duration: 200,
			easing: cubicInOut
		})
	}
	
	$: tween.set(valueNumber)
	
	$: if(!formatter) {
		formatter = new Intl.NumberFormat(locale ?? "fr", options ?? {
			maximumFractionDigits: 0
		})
	}
	
	$: valueNumber = value ?? 0

</script>

{formatter.format($tween)}