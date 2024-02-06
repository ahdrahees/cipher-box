<script>
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/auth.store';
	import {
		ThemeToggle,
		Popover,
		IconUser,
		IconLogout,
		IconSettings
	} from '@dfinity/gix-components';

	let visible = false;
	let button;
</script>

<button bind:this={button} class="icon-only toggle" on:click={() => (visible = !visible)}
	><IconUser /></button
>

<Popover bind:visible anchor={button} direction="rtl">
	<div class="menuInfo">
		<ThemeToggle />
		<button on:click={() => goto('/settings')}
			><div class="popoverMenuButton"><IconSettings /> Settings</div></button
		>
		<button on:click={() => authStore.signOut()}
			><div class="popoverMenuButton"><IconLogout /> Logout</div></button
		>
	</div>
</Popover>

<style lang="scss" global>
	.menuInfo {
		width: 100%;

		display: flex;
		flex-direction: column;
		gap: var(--padding-3x);
	}
	.popoverMenuButton {
		display: flex;
		flex-direction: row;
		gap: 5px;
	}

	button {
		display: flex;
		justify-content: flex-start;
		align-items: center;

		color: inherit;
		transition: color var(--animation-time-short) ease-in;

		font-size: var(--font-size-h5);
		font-weight: var(--font-weight-bold);

		text-decoration: none;
		outline: none;

		padding: 0 0 0 var(--padding);
		gap: var(--padding);

		&:focus,
		&:hover {
			text-decoration: none;
		}

		&:focus,
		&:hover {
			color: var(--primary);
		}
	}
</style>
