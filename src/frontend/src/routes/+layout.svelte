<script lang="ts">
	import { page } from '$app/stores';
	import { authStore } from '$lib/auth.store';
	import { onDestroy } from 'svelte';
	import {
		Layout,
		MenuItem,
		HeaderTitle,
		Content,
		IconLockClosed,
		IconPassword,
		IconLockClock,
		Value,
		BusyScreen,
		Toasts
	} from '@dfinity/gix-components';

	import PageBanner from '$lib/components/PageBanner/PageBanner.svelte';
	import UserPopoverMenu from '$lib/components/UserPopoverMenu/UserPopoverMenu.svelte';
	import { encryptionKey } from '$lib/stores/encryption-key.store';
	import { totpStore } from '$lib/stores/totop.store';
	import { passwordStore } from '$lib/stores/password.store';

	let pathname: string;
	$: ({
		url: { pathname }
	} = $page);

	$: pageTitle = $page.url.pathname.startsWith('/pass')
		? 'My Passwords'
		: $page.url.pathname.startsWith('/settings')
			? 'Settings'
			: 'My TOTPs';

	let fetchWait = false;

	const unsubscribe = authStore.subscribe(async (value) => {
		await encryptionKey.updateEncryptedKey();

		if ($totpStore.encryptedTotps.length === 0 && $authStore.isAuthenticated) {
			fetchWait = true;
			await totpStore.fetchTOTP();
			fetchWait = false;
		} else {
			// await totpStore.sync();
		}

		if ($passwordStore.encryptedPasswords.length === 0 && $authStore.isAuthenticated) {
			await passwordStore.fetchPass();
		} else {
			// await passwordStore.sync();
		}
	});
	onDestroy(unsubscribe);
</script>

{#if $authStore.isAuthenticated}
	<Layout>
		<div slot="menu-logo" class="logo">
			<div class="iconAndName">
				<IconLockClosed />
				<h1 class="value">Cipher Box</h1>
			</div>
		</div>
		<svelte:fragment slot="menu-items">
			<MenuItem href="/" selected={pathname === '/'} on:click
				><div class="alignMenuItemsIcon"><IconLockClock />My TOTPs</div></MenuItem
			>
			<MenuItem href="/pass" selected={pathname.startsWith('/pass')} on:click>
				<div class="alignMenuItemsIcon">
					<IconPassword />My Passwords
				</div></MenuItem
			>
		</svelte:fragment>

		<Content>
			<HeaderTitle slot="title"><Value>{pageTitle}</Value></HeaderTitle>

			<main>
				{#if !fetchWait}
					<slot />
				{/if}
			</main>
			<div class="userPopoverMenu" slot="toolbar-end">
				<UserPopoverMenu />
			</div>
		</Content>
	</Layout>
{:else}
	<PageBanner />
{/if}

<Toasts />
<BusyScreen />

<style lang="scss" global>
	@use '@dfinity/gix-components/dist/styles/mixins/media';
	@import '@dfinity/gix-components/dist/styles/global.scss';

	.iconAndName {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.userPopoverMenu {
		margin-left: auto;
		padding: 5px;
	}
	.alignMenuItemsIcon {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
	}

	@include media.min-width(large) {
		.userPopoverMenu {
			margin-left: auto;
			padding: 5px;
		}
	}
</style>
