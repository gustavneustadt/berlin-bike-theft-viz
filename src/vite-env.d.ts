/// <reference types="svelte" />
/// <reference types="vite/client" />
declare module "d3";

interface TheftRecord {
	lor: number
	bikeType: string
	dateStart: Date
	dateEnd: Date
	dateRange: TheftRecordProbItem[]
	dateDurationHours: number
	burglary: boolean
	damageAmount: number
	attemptedTheft: boolean
}

interface TheftRecordProbItem {
	probScore: number,
	date: Date
}

interface Graph {
	textId: number
	component?: SvelteComponent
}

interface StoryText {
	subtitle?: string
	text: string
	component: 
}

interface StorySection {
	title?: string
	texts: StoryText[]
}