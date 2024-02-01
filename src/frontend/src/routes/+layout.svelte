<script lang="ts">
	import { page } from '$app/stores';
	import { authStore } from '$lib/auth.store';
	import { Layout, MenuItem, HeaderTitle, Content, IconLockClosed } from '@dfinity/gix-components';

	let pathname: string;
	$: ({
		url: { pathname }
	} = $page);
</script>

<Layout>
	<div slot="menu-logo" class="logo">
		<div class="iconAndName">
			<IconLockClosed />
			<h1 class="value">Cipher Box</h1>
		</div>
	</div>
	<svelte:fragment slot="menu-items">
		<MenuItem href="/" selected={pathname === '/'} on:click>Authenicator</MenuItem>
		<MenuItem href="/pass" selected={pathname.startsWith('/pass')} on:click>Password</MenuItem>
	</svelte:fragment>

	<Content>
		<HeaderTitle slot="title">Cipher Box</HeaderTitle>

		<main>
			<slot />
		</main>
	</Content>
</Layout>

<style lang="scss" global>
	// @import '../../../../node_modules/@dfinity/gix-components/dist/styles/global.scss';
	@import '@dfinity/gix-components/dist/styles/global.scss';

	.iconAndName {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
