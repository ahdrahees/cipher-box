<script lang="ts">
	import { authStore } from '$lib/auth.store';
	import { PageBanner, IconNeuronsPage, Value, ThemeToggle } from '@dfinity/gix-components';
</script>

<div class="pageBannerThemeToggle"><ThemeToggle /></div>
<div class="alignPageBanner">
	<PageBanner>
		<IconNeuronsPage slot="image" />
		<span slot="title"><h1 class="boldH1">Cipher Box</h1></span>
		<div slot="description" class="">
			<p class="boldParagraph">
				<Value>Your TOTP and Password Manager on the Internet Computer.</Value>
			</p>
			<br />
			<!-- <p>
			Create and link accounts (including hardware wallets), transfer ICP, participate in Internet
			Computer governance by staking ICP in neurons, and earn voting rewards.
		</p> -->
		</div>
		<button class="primary" slot="actions" on:click={() => authStore.signIn()}
			>Connect with Internet Identity</button
		>
	</PageBanner>
</div>

<style lang="scss" global>
	@import '@dfinity/gix-components/dist/styles/global.scss';
	.boldParagraph {
		font-size: large;
		font-weight: 600;
	}
	.boldH1 {
		font-size: xx-large;
		font-size: 40px;
		/* font-weight: bolder; */
		font-weight: bold;
	}
	.alignPageBanner {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 90vh;
	}
	.pageBannerThemeToggle {
		display: flex;
		flex-direction: row-reverse;
		margin: 15px;
	}
</style>
