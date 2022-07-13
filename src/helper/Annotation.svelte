<script lang="ts">
	import * as d3 from "d3"
	import * as annotation from "d3-svg-annotation"
	export let highlight: boolean = false
	
	
	export let x: number
	export let y: number
	export let note: {
		label?: string,
		title?: string,
		align?: string
		lineType?: string
		padding?: number,
		bgOpacity?: number,
		bgPadding?: number|{
			top?: number,
			bottom?: number,
			right?: number,
			left?: number
		}
	}
	export let subject: {
		x1: number,
		x2: number
	}|{
		y1: number,
		y2: number
	} = null
	export let type: any
	export let dx: number
	export let dy: number
	
	let wrapper
	
	document.fonts.ready.then((e) => {
		fontLoaded = true
	});
	
	let fontLoaded = false
	
	$: if(wrapper && fontLoaded) {
		const makeAnnotation = annotation.annotation().annotations([
			{
				x,
				y,
				type,
				dx,
				dy,
				note,
				subject
			}
		])
		
		d3.select(wrapper).call(makeAnnotation).selectAll("*").attr("fill", null).attr("stroke", null).attr("opacity", null).attr("fill-opacity", null)
	}
</script>

<style>

</style>

<g bind:this={wrapper} class:highlight={highlight}>
	
</g>
