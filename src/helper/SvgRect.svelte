<script lang="ts">
	type PositionFunction = (width: number, height: number) => number
	
	export let width: number = 10
	export let height: number = 10
	export let r: [number, number, number, number]|[number, number]|number = 0
	export let sharpness: number = 0.6
	
	export let x: number = 0
	export let y: number = 0
	
	export let xFunc: PositionFunction = (w, h): number => 0
	export let yFunc: PositionFunction = (w, h): number => 0
	
	$: xFuncValue = xFunc(width, height)
	$: yFuncValue = yFunc(width, height)
	
	$: xPosition = xFuncValue + x 
	$: yPosition = yFuncValue + y
	
	const getPath = function(
		w: number, 
		h: number, 
		x: number,
		y: number,
		radius: [number, number, number, number]|[number, number]|number, sharpness: number): string {
		const normalized = false
		
		const shortestEdge = w >= h ? h : w
		
		const clampNumber = (num: number, a:number, b:number) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b))
		
		if(shortestEdge <= 0) {
			return ""
		}
		
		let cornerRadius = {
			tl: 0,
			tr: 0,
			br: 0,
			bl: 0
		}
		
		if(typeof radius === "number") {
			radius = clampNumber(radius, 0, shortestEdge / 2)
			
			cornerRadius.tl = radius
			cornerRadius.tr = radius
			cornerRadius.br = radius
			cornerRadius.bl = radius
		} else {
			if(radius.length > 2) {
				cornerRadius.tl = radius[0]
				cornerRadius.tr = radius[1]
				cornerRadius.br = radius[2]
				cornerRadius.bl = radius[3]
			}
			if(radius.length === 2) {
				cornerRadius.tl = radius[0]
				cornerRadius.tr = radius[1]
				cornerRadius.br = radius[0]
				cornerRadius.bl = radius[1]
			}
			
			const availableSpace = {
				top: width,
				right: height,
				bottom: width,
				left: height
			}
			
			const edges = {
				tl: ["top", "left"],
				tr: ["top", "right"],
				br: ["bottom", "right"],
				bl: ["bottom", "left"]
			}
			
			const calcLengths = Object.entries(cornerRadius).map(
				([name, length]: [string, number]) => {
					return [name, clampNumber(length, 0, shortestEdge / 2)]
				}
			)

			cornerRadius = Object.fromEntries(calcLengths)
		}
		
		const cornerSharpness = {
			tl: sharpness * cornerRadius.tl,
			tr: sharpness * cornerRadius.tr,
			br: sharpness * cornerRadius.br,
			bl: sharpness * cornerRadius.bl
		}
		
		const cornerLength = {
			tl: {
				x: cornerRadius.tl,
				y: cornerRadius.tl
			},
			tr: {
				x: cornerRadius.tr,
				y: cornerRadius.tr
			},
			br: {
				x: cornerRadius.br,
				y: cornerRadius.br
			},
			bl: {
				x: cornerRadius.bl,
				y: cornerRadius.bl
			}
		}
		
		const normalization = {
			x: w,
			y: h
		}
		
		const cornerAngle = {
			tl: {
				x: (cornerSharpness.tl / w) * normalization.x,
				y: (cornerSharpness.tl / h) * normalization.y
			},
			tr: {
				x: (cornerSharpness.tr / w) * normalization.x,
				y: (cornerSharpness.tr / h) * normalization.y
			},
			br: {
				x: (cornerSharpness.br / w) * normalization.x,
				y: (cornerSharpness.br / h) * normalization.y
			},
			bl: {
				x: (cornerSharpness.bl / w) * normalization.x,
				y: (cornerSharpness.bl / h) * normalization.y
			}	
		}
		const corners = {
			a: cornerAngle,
			tl: {
				xa: 0.0 + x,
				ya: cornerLength.tl.y + y,
				xb: cornerLength.tl.x + x,
				yb: 0.0 + y
			},
			tr: {
				xa: w - cornerLength.tr.x + x,
				ya: 0.0 + y,
				xb: w + x,
				yb: cornerLength.tr.y + y
			},
			br: {
				xa: w + x,
				ya: (h - cornerLength.br.y) + y,
				xb: (w - cornerLength.br.x) + x,
				yb: h + y
			},
			bl: {
				xa: cornerLength.bl.x + x,
				ya: h + y,
				xb: 0 + x,
				yb: h - cornerLength.bl.y + y
			},
		}
		
		
		const path = `M ${corners.tl.xa} ${corners.tl.ya}
		C ${corners.tl.xa} ${corners.tl.ya - corners.a.tl.y}, ${corners.tl.xb - corners.a.tl.x} ${corners.tl.yb}, ${corners.tl.xb} ${corners.tl.yb}
		L ${corners.tr.xa} ${corners.tr.ya}
		C ${corners.tr.xa + corners.a.tr.x} ${corners.tr.ya}, ${corners.tr.xb} ${corners.tr.yb - corners.a.tr.y}, ${corners.tr.xb} ${corners.tr.yb}
		L ${corners.br.xa} ${corners.br.ya}
		C ${corners.br.xa} ${corners.br.ya + corners.a.br.y}, ${corners.br.xb + corners.a.br.x} ${corners.br.yb}, ${corners.br.xb} ${corners.br.yb}
		L ${corners.bl.xa} ${corners.bl.ya}
		C ${corners.bl.xa - corners.a.bl.x} ${corners.bl.ya}, ${corners.bl.xb} ${corners.bl.yb + corners.a.bl.y}, ${corners.bl.xb} ${corners.bl.yb}
		Z`
		
		return path.replace(/\n/g, '')
	}	
	
	$: path = getPath(width, height, xPosition, yPosition, r, sharpness)

	
</script>

<style>

</style>

<path on:click d={path} class={$$props.class} fill={$$props.fill} stroke={$$props.stroke}>
</path>
