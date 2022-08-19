<script context="module" lang="ts">
	export interface LineEndFunction {
		(position: Point): string
	}
	export enum LineEnd {
		Line,
		LineOneSide,
		Dot,
		Arrow,
		None
	}
	export type Point = [number, number]
	export type Vector = [number, number]
</script>

<script lang="ts">

	export let x1: number
	export let y1: number
	
	export let x2: number = null
	export let y2: number = null
	
	export let end: LineEnd = LineEnd.None
	export let start: LineEnd = LineEnd.None
	export let lineEndHeight: number = 10
	
	export let strokeWidth: number = 1
	
	$: pos = {
		x1: x1,
		x2: x2 ?? x1,
		y1: y1,
		y2: y2 ?? y1
	}
	
	$: path = `M ${pos.x1} ${pos.y1} L ${pos.x2} ${pos.y2}`

	const crossProduct = (v1: Vector, v2: Vector): Vector => {
		return [
			v1[1]*v2[0] - v1[0]*v2[1],
			v1[0]*v2[1] - v1[1]*v2[0]
		]
	}
	
	const vectorLength = ([x, y]: Vector): number => {
		return Math.sqrt(x * x + y * y)
	}
	
	const unitVector = ([x, y]: Vector, lengthTarget: number = 1): Vector => {
		const length = vectorLength([x, y])
		return [(x / length) * lengthTarget, (y / length) * lengthTarget]
	}
	
	const pointToVector = ([x1, y1]: Point, [x2, y2]: Point): Vector => {
		return [x2 - x1, y2 - y1]
	}
	
	
	const rotate = ([x, y]: Vector, angle: number): Vector => {
		return [
			(x * Math.cos(angle) - y * Math.sin(angle)),
			(x * Math.sin(angle) + y * Math.cos(angle))
		]
	}
	
	
	const lineEndPaths: Map<LineEnd, LineEndFunction> = new Map([
		[LineEnd.None, function(position: Point = [0, 0]): string {
			return ""
		}],
		[LineEnd.Dot, function(position: Point = [0, 0]): string {
			const size = lineEndHeight
			const handleLength = 0.552284749831 * size / 2
			
			const px = position[0]
			const py = position[1] - size / 2
			
			return `
				M ${px} ${py}
				C ${px+handleLength} ${py} ${px+size/2} ${py+size/2-handleLength} ${px+size/2} ${py+size/2}
				C ${px+size/2} ${py+size/2+handleLength} ${px+handleLength} ${py+size} ${px} ${py+size}
				C ${px - handleLength} ${py+size} ${px - size/2} ${py+size/2 + handleLength} ${px - size/2} ${py+size/2}
				C ${px - size/2} ${py+size/2 - handleLength} ${px - handleLength} ${py} ${px} ${py}
			`
		}],
		[LineEnd.LineOneSide, function(position: Point = [0, 0]): string {
			const p1: [number, number] = [pos.x1, pos.y1]
			const p2: [number, number] = [pos.x2, pos.y2]
			
			const v: [number, number] = p2[0] === p1[0] && p2[1] === p1[1] ? [lineEndHeight / 2, 0] : unitVector(pointToVector(p1, p2), lineEndHeight)
			
			const [px, py] = position
			
			const [rx1, ry1] = rotate(v, Math.PI / 2)
			
			return `M ${px + rx1} ${py + ry1} L ${px} ${py}`
		}],
		[LineEnd.Line, function(position: Point = [0, 0]): string {
			const p1: [number, number] = [pos.x1, pos.y1]
			const p2: [number, number] = [pos.x2, pos.y2]
			
			const v: [number, number] = p2[0] === p1[0] && p2[1] === p1[1] ? [lineEndHeight / 2, 0] : unitVector(pointToVector(p1, p2), lineEndHeight / 2)
		
			const [px, py] = position
			
			const [rx1, ry1] = rotate(v, Math.PI / 2)
			const [rx2, ry2] = rotate([rx1, ry1], Math.PI)
			
			return `M ${px + rx1} ${py + ry1} L ${px + rx2} ${py + ry2}`
		}],
		[LineEnd.Arrow, function(position: Point = [0, 0]): string {
			return ""
		}]
	])
</script>

<style>

</style>

	<path d={path} stroke-width={strokeWidth} stroke="currentColor"/>


	{#if end != LineEnd.None}
		<path class="line-end end"  d={lineEndPaths.get(end)([pos.x2, pos.y2])} stroke-width={strokeWidth} stroke="currentColor" fill="none"/>
	{/if}
	{#if start != LineEnd.None}
		<path class="line-end start" d={lineEndPaths.get(start)([pos.x1, pos.y1])} stroke-width={strokeWidth} stroke="currentColor" fill="none"/>
	{/if}