<script lang="ts">
	import * as d3 from "d3"
	import * as annotation from "d3-svg-annotation"
	export let highlight: boolean = false
	
	
	export let x: number = null
	export let y: number = null
	export let note: {
		label?: string,
		title?: string,
		align?: string
		lineType?: string
		padding?: number,
		bgOpacity?: number,
		wrap?: number,
		bgPadding?: number|{
			top?: number,
			bottom?: number,
			right?: number,
			left?: number
		}
	} = null
	export let subject: {
		x1: number,
		x2: number
	}|{
		y1: number,
		y2: number
	} = null
	export let type: any = annotation.annotationLabel
	export let dx: number = 0
	export let dy: number = 0
	
	export let annotationData: {
		note?: {
			label?: string,
			title?: string,
			align?: string
			lineType?: string
			padding?: number,
			bgOpacity?: number,
			wrap?: number,
			bgPadding?: number|{
				top?: number,
				bottom?: number,
				right?: number,
				left?: number
			}
		},
		type?: any,
		dx?: number,
		dy?: number,
		x?: number,
		y?: number,
		subject?: {
			x1: number,
			x2: number
		}|{
			y1: number,
			y2: number
		}
	} = {}
	
	$: data = {
		note,
		type,
		dx,
		dy,
		subject,
		x,
		y,
		...annotationData
	}
	
	let wrapper
	
	document.fonts.ready.then((e) => {
		fontLoaded = true
	});
	
	let fontLoaded = false
	
	$: if(wrapper && fontLoaded) {
		const makeAnnotation = annotation.annotation().annotations([
			data
		])
		
		d3.select(wrapper).call(makeAnnotation).selectAll("*").attr("fill", null).attr("stroke", null).attr("opacity", null).attr("fill-opacity", null)
	}
</script>

<style>

</style>

<g bind:this={wrapper} class:highlight={highlight}>
	
</g>
