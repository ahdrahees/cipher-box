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
export type IconEyeProps = typeof __propDef.props;
export type IconEyeEvents = typeof __propDef.events;
export type IconEyeSlots = typeof __propDef.slots;
export default class IconEye extends SvelteComponent<IconEyeProps, IconEyeEvents, IconEyeSlots> {}
export {};
