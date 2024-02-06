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
export type IconEditProps = typeof __propDef.props;
export type IconEditEvents = typeof __propDef.events;
export type IconEditSlots = typeof __propDef.slots;
export default class IconEdit extends SvelteComponent<
	IconEditProps,
	IconEditEvents,
	IconEditSlots
> {}
export {};
