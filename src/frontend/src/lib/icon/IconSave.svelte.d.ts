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
export type IconSaveProps = typeof __propDef.props;
export type IconSaveEvents = typeof __propDef.events;
export type IconSaveSlots = typeof __propDef.slots;
export default class IconSave extends SvelteComponent<
	IconSaveProps,
	IconSaveEvents,
	IconSaveSlots
> {}
export {};
