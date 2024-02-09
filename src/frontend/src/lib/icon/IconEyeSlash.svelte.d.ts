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
export type IconEyeSlashProps = typeof __propDef.props;
export type IconEyeSlashEvents = typeof __propDef.events;
export type IconEyeSlashSlots = typeof __propDef.slots;
export default class IconEyeSlash extends SvelteComponent<
	IconEyeSlashProps,
	IconEyeSlashEvents,
	IconEyeSlashSlots
> {}
export {};
