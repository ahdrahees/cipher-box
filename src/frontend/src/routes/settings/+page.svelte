<script lang="ts">
	import { Copy, Section, IconQRCodeScanner, IconCheckCircle } from '@dfinity/gix-components';
	import { authStore } from '$lib/auth.store';

	function shortenWalletAddress(address: string) {
		const firstSixChars = address.slice(0, 7);
		const lastFourChars = address.slice(-7);
		const middleEllipsis = '...';
		return firstSixChars + middleEllipsis + lastFourChars;
	}
</script>

<div class="display-flex">
	<div class="wrapper">
		<Section>
			<div class="container-space" slot="description">
				<p>Your Principal</p>
				<div class="container-center">
					{shortenWalletAddress($authStore.identity.getPrincipal().toString())}
					<Copy value={$authStore.identity.getPrincipal().toString()} />
				</div>
			</div>
		</Section>
	</div>
</div>

<style lang="scss">
	.container-space {
		display: flex;
		justify-content: space-between;
	}
	.container-center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.wrapper {
		background-color: var(--card-background);
		margin: var(--padding-2x) 0;

		width: 100%;
		height: 75vh;

		border-radius: 10px;
	}

	.display-flex {
		display: flex;
		align-items: center;
	}
</style>
