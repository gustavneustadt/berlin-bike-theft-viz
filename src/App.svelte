<script lang="ts">
import { onMount, setContext, getContext } from "svelte"
import * as d3 from "d3"
import Color from "colorjs.io"

import Scrollama from "scrollama"
import Texts from "./Texts.svelte"
import GraphCollection from './GraphCollection.svelte'
import type Scale from "d3-scale"

const scroller = Scrollama()
let currentScrollIndex: number
let isScrollDirectionUp: boolean
let textElements: HTMLDivElement[]


let data: TheftRecord[]

$: setContext("theftData", data)
$: console.log(data)

setContext("colors", {
	getColors: (element: Element) => {
		const styles = [	
			"--colorScalePrimary",
			"--colorScaleSecondary",
		]
		const computed = getComputedStyle(element)
		const styleMap: Map<string, Color> = new Map()
		
		styles.forEach((d: string) => {
			
			const property = computed.getPropertyValue(d)
			const color =  new Color(Color.parse(property))
			
			styleMap.set(d, color)
		})
		return styleMap
	},
	remap: (number: number, bound: [number, number] = [0, 1], exponent: number = 1, reverse: boolean = false): number => {
		const targetBound = [0, 1]
		
		return d3.scaleSqrt()
			.exponent(exponent)
			.domain(bound)
			.range(reverse ? targetBound.reverse : targetBound)(number)
	},
	get colorScale() {
		const colors = this.getColors(document.querySelector("body"))
		return colors.get("--colorScaleSecondary").range(colors.get("--colorScalePrimary"), {
			space: colors.get("--colorScalePrimary").space
		})
	}
})

const url = 'https://corsproxy.io/?' + encodeURIComponent('https://www.internetwache-polizei-berlin.de/vdb/Fahrraddiebstahl.csv');

onMount(async () => {
	await d3.csv(url).then((d: any) => { 
		data = d.map((item: any): TheftRecord => {
			const dateStart = getDateFrom(item.TATZEIT_ANFANG_DATUM, item.TATZEIT_ANFANG_STUNDE)
			const dateEnd = getDateFrom(item.TATZEIT_ENDE_DATUM, item.TATZEIT_ENDE_STUNDE)
			
			const dateRange: TheftRecordProbItem[] = [...d3.timeHour.every(1).range(dateStart, dateEnd), dateEnd].map(
				(d: Date, _, arr: Date[]) => {
					return {
						date: d,
						probScore: 1 / arr.length
					}
				}
			)
			
			return {
				lor: Number(item.LOR),
				bikeType: item.ART_DES_FAHRRADS,
				dateStart: dateStart,
				dateEnd: dateEnd,
				dateDurationHours: dateRange.length,
				burglary: item.DELIKT == "Keller- und Bodeneinbruch",
				damageAmount: Number(item.SCHADENSHOEHE),
				attemptedTheft: item.VERSUCH !== "Nein",
				dateRange: dateRange
			}

		})
	})
})

function getDateFrom(date: string, hour: string): Date {
	const regex = /(?<day>\d{1,2}).(?<month>\d{1,2}).(?<year>\d{4})/
	const dateGroups = regex.exec(date).groups
	let parsedDate = new Date(Date.parse(`${dateGroups.year}-${dateGroups.month}-${dateGroups.day}T${hour}:00:00`))
	return parsedDate
}

let progress: number = 0

let videoElement

$: if(videoElement) { videoElement.play() }

</script>

<style>

.graphs-wrapper {
	display: flex;
	gap: 1rem;
	flex-direction: column;
	}
main {
	display: flex;
	align-items: stretch;
	max-width: 80vw;
	margin: 0 auto;
}

.text-content-wrapper {
	max-width: 30rem;
	flex: 1 1 50%;
}
.graphs-wrapper {
	flex: 1 2 50%;
	max-width: 70rem;
}

h1 {
	font-size: 1em;
	display: flex;
	flex-direction: column;
	line-height: .9;
	letter-spacing: -.01em;
	color: var(--colorAccentPrimaryMuted);
	text-align: center;
	margin: 0;
}

h1 > span:first-child {
	font-weight: 500;
	font-size: .8em;
}

h2 {
	font-size: 1rem;
	font-weight: 400;
	color: var(--colorTextPrimary);
	text-align: center;
	/* margin: none; */
	font-variant-caps: all-small-caps;
	letter-spacing: .1rem;
	text-shadow: 0 1px 0 black, 0 0 2px black;
}
header {
	font-size: min(min(8.5vw, 14vh), 8rem);
	height: 100vh;
	width: 100%;
	left: 0;
	top: 0;
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	z-index: 100;
	text-shadow: 0 1.5px 0px black;
}

header > .video-wrapper {
	position: absolute;
	z-index: -1;
	height: 100%;
	width: 100%;
	padding: 1rem;
	box-sizing: border-box;
}
.video-wrapper video {
	width: 100%;
	height: 100%;
	object-fit: cover;
	mix-blend-mode: hard-light;
	margin: none;
}
.video-wrapper .background {
	background: var(--colorAccentPrimary);
	position: absolute;
	top: 0;
	left: 0;
	/* bottom: 0; */
	/* right: 0; */
	height: 100%;
	width: 100%;
	z-index: -1;
}

author {
	position: absolute;
	bottom: 2rem;
	color: var(--colorTextMuted);
	font-size: .8rem;
	font-variant-caps: all-small-caps;
	letter-spacing: .1rem;
	text-align: center;
}
</style>

{#if data != undefined}
	<header>
		<h1>
			<span>Grand Theft</span>
			<span>Berlin Bikes</span>
		</h1>
		<h2>
			Visualizing daily Bike Theft Data of Berlin
		</h2>
		<author>by Gustav Neustadt 🙑</author>
		<div class="video-wrapper">
			<div class="background"></div>
			<video muted autoplay playsinline loop>
				<source src="/background_grey.mp4" type="video/mp4"/>
				<source src="/background_grey.webm" type="video/webm"/>
			</video>
		</div>
	</header>
	<main>
		<div class="text-content-wrapper">
			<Texts index="{currentScrollIndex}" isScrollDirectionUp={isScrollDirectionUp} bind:textElements={textElements} />
		</div>
		<div class="graphs-wrapper">
			<GraphCollection index={currentScrollIndex} progress={progress} />
		</div>
	</main>
{/if}