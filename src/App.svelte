<script lang="ts">
import { onMount, setContext, getContext } from "svelte"
import * as d3 from "d3"
import Color from "colorjs.io"

import Scrollama from "scrollama"
import Texts from "./Texts.svelte"
import GraphCollection from './GraphCollection.svelte'
import type Scale from "d3-scale"
import ContentController from './ContentController.svelte'

const scroller = Scrollama()
let currentScrollIndex: number
let isScrollDirectionUp: boolean
let textElements: HTMLDivElement[]


let data: TheftRecord[]

$: setContext("theftData", data)

setContext("colors", {
	getColors: (element: Element) => {
		const styles = [	
			"--colorScalePrimary",
			"--colorScaleSecondary",
			"--colorAccentPrimary",
			"--colorBackground",
			"--colorTextDark"
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
	get colors() {
		return this.getColors(document.querySelector("body"))
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
		return this.createColorScale(colors.get("--colorScaleSecondary"), colors.get("--colorScalePrimary"))
	},
	createColorScale(colorA: Color, colorB: Color) {
		return colorA.range(colorB, {
			space: colorA.space
		})
	}
})

onMount(async () => {
	await d3.csv("data.csv").then((d: any) => { 
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


let videoElement

$: if(videoElement) { videoElement.play() }

</script>

<style>

main {
	margin: 0 auto;
	position: relative;
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
	/* mix-blend-mode: hard-light; */
	opacity: .9;
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

.credits p {
	width: 100%;
	color: var(--colorTextPrimary);
	line-height: 1.8;
}
.credits {
	width: 100%;
	background: var(--colorTextDarkMuted);
	padding: 10rem 0;
	z-index: 100;
	position: relative;
	min-height: 100vh;
	box-sizing: border-box;
}

.credits .text-wrapper {
	width: 32rem;
	max-width: calc(100vw - 2rem);
	margin: 0 auto;
}

.credits h3 {
	margin: 0 auto 1.5rem;
	width: 100%;
	color: var(--colorText);
	font-weight: 600;
	font-size: 1.4rem;
}

.credits h4 {
	font-variant-caps: all-small-caps;
	color: var(--colorText);
	letter-spacing: .1rem;
	font-weight: 400;
	font-size: 1.2rem;
	margin: 2rem 0 1rem;
}

.credits .source {
	margin: 1rem 0;
	color: var(--colorTextPrimaryMuted);
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.credits .source .link {
	color: var(--colorAccentPrimaryMuted);
}

.credits .source .link:hover {
	color: var(--colorAccentPrimary);
}
.credits .source .title {
	font-size: 1rem;
}

.credits .source .desc {
	font-variant-caps: all-small-caps;
	letter-spacing: .1rem;
	opacity: .8;
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
		<author>by Gustav Neustadt</author>
		<div class="video-wrapper">
			<div class="background"></div>
			<video muted autoplay playsinline loop>
				<source src="/background_new.mp4" type="video/mp4"/>
				<!-- <source src="/background_grey.webm" type="video/webm"/> -->
			</video>
		</div>
	</header>
	<main>
		<ContentController />
			
	</main>
	<div class="credits">
		<div class="text-wrapper">
			<h3>
				Credits
			</h3>
			<p>
				This data visualisation project is one of 6 pojects resulted from a course I took at the University of Applied Sciences in Potsdam (FHP) by Lucas Vogel: <em>Citizen Science — Stadtdaten visualisieren</em>.
			</p>
			<p>
				August 2022
			</p>
			<div class="source">
				<div class="desc">Source Code</div>
				<a class="link" href="https://github.com/gustavneustadt/berlin-bike-theft-viz" target="_blank">GitHub</a>
			</div>
			
			<div class="source">
				<div class="desc">concept, design & development</div>
				<div class="title">Gustav Neustadt</div>
				<a class="link" href="https://twitter.com/gustavneustadt" target="_blank">Twitter</a>
			</div>
			
			<div class="source">
				<div class="desc">supervision</div>
				<div class="title">Lucas Vogel</div>
				<a class="link" href="https://twitter.com/soyvogelino" target="_blank">Twitter</a>
			</div>
			
			<h4>Sources</h4>
			<div class="source">
				<div class="desc">Data source</div>
				<div class="title">Fahrraddiebstahl in Berlin</div>
				<a class="link" href="https://daten.berlin.de/datensaetze/fahrraddiebstahl-berlin" target="_blank">Berlin Open Data</a>
			</div>
			
			<div class="source">
				<div class="desc">Font</div>
				<div class="title"><em>TheMix</em> by Luc(as) de Groot</div>
				<a class="link" href="http://www.lucasfonts.com/fonts/the-mix" target="_blank">LucasFonts</a>
			</div>
			
			<div class="source">
				<div class="desc">Video Clip</div>
				<div class="title">Attempted Bike Theft - Angle Grinder - 02.15.19</div>
				<a class="link" href="https://www.youtube.com/watch?v=069iyliznmI" target="_blank">youtube.com/Will Press</a>
			</div>
			<div class="source">
				<div class="desc">Video Clip</div>
				<div class="title">Bike Theft - Cutting Kryptonite with a battery powered angle grinder</div>
				<a class="link" href="https://www.youtube.com/watch?v=kcHOVSsfXQ0" target="_blank">youtube.com/David de Sotomayor</a>
			</div>
			<div class="source">
				<div class="desc">Video Clip</div>
				<div class="title">Silke's Giant Explore e bike theft 22 Oct 2019</div>
				<a class="link" href="https://www.youtube.com/watch?v=0DhICLwxfZY" target="_blank">youtube.com/Mark Cresswell</a>
			</div>
			<div class="source">
				<div class="desc">Video Clip</div>
				<div class="title">Security footage of Portland bike thefts</div>
				<a class="link" href="https://www.youtube.com/watch?v=dWvM_ND9CI4" target="_blank">youtube.com/KOIN 6</a>
			</div>
			<div class="source">
				<div class="desc">Video Clip</div>
				<div class="title">Sparks Fly During Attempted Bike Theft</div>
				<a class="link" href="https://www.youtube.com/watch?v=G0ohO91xf1w" target="_blank">youtube.com/Stealth Monitoring</a>
			</div>
			<div class="source">
				<div class="desc">Video Clip</div>
				<div class="title">Caught On Camera: E-Bike Stolen In Brooklyn</div>
				<a class="link" href="https://www.youtube.com/watch?v=lFL8gW0-tLw" target="_blank">youtube.com/CBS New York</a>
			</div>
			<div class="source">
				<div class="desc">Video Clip</div>
				<div class="title">guy tries stealing Eva's bike with an angle grinder</div>
				<a class="link" href="https://www.youtube.com/watch?v=GNe6nyMfT3w" target="_blank">youtube.com/Charvak Karpe</a>
			</div>
			<div class="source">
				<div class="desc">Video Clip</div>
				<div class="title">My Bike Being Stolen to Habanera (Carmen)</div>
				<a class="link" href="https://www.youtube.com/watch?v=EhPclNBlNSQ" target="_blank">youtube.com/Someone YouDontKnow</a>
			</div>
		</div>
	</div>
{/if}