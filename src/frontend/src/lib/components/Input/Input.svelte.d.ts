import { SvelteComponent } from 'svelte';
declare const __propDef: {
	props: {
		name: string;
		inputType?: 'number' | 'text' | 'icp' | 'password' | undefined;
		required?: boolean | undefined;
		spellcheck?: boolean | undefined;
		step?: number | 'any' | undefined;
		disabled?: boolean | undefined;
		minLength?: number | undefined;
		max?: number | undefined;
		value?: string | number | undefined;
		placeholder: string;
		testId?: string | undefined;
		autocomplete?: 'off' | 'on' | undefined;
		showInfo?: boolean | undefined;
	};
	events: {
		blur: FocusEvent;
		focus: FocusEvent;
		nnsInput: CustomEvent<any>;
	} & {
		[evt: string]: CustomEvent<any>;
	};
	slots: {
		start: {};
		label: {};
		end: {};
		'inner-end': {};
	};
};
export type InputProps = typeof __propDef.props;
export type InputEvents = typeof __propDef.events;
export type InputSlots = typeof __propDef.slots;
export default class Input extends SvelteComponent<InputProps, InputEvents, InputSlots> {}
export {};
