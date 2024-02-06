import { SvelteComponent } from 'svelte';
declare const __propDef: {
	props: {
		size?: string | undefined;
	};
	events: {
		[evt: string]: CustomEvent<any>;
	};
	slots: {};
};
export type IconDeleteProps = typeof __propDef.props;
export type IconDeleteEvents = typeof __propDef.events;
export type IconDeleteSlots = typeof __propDef.slots;
export default class IconDelete extends SvelteComponent<
	IconDeleteProps,
	IconDeleteEvents,
	IconDeleteSlots
> {}
export {};
