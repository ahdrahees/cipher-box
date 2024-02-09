<script lang="ts">
	import { Input, Section } from '@dfinity/gix-components';
	import { totpStore } from '$lib/stores/totop.store';
	import { encryptionKey } from '$lib/stores/encryption-key.store';

	export const totpAddSubmit = new CustomEvent('totpAddSubmit');

	let totpKey: string = '';
	let totpName: string = '';

	let buttonDisable = true;
	let messageforName = '';
	let messageforKey = '';

	function validateInputName() {
		if ($encryptionKey === null) {
			messageforKey = 'No symmetric key to encrypt';
		}
		if (totpName.length < 1) {
			buttonDisable = true;
			messageforName = 'Enter a name for this Account';
		} else {
			messageforName = '';
		}

		if (totpName.length >= 1 && totpKey.length >= 16) {
			buttonDisable = false;
			messageforName = '';
			messageforKey = '';
		}
	}

	function validateInputKey() {
		if ($encryptionKey === null) {
			messageforKey = 'No symmetric key to encrypt';
		}
		if (totpKey.length < 16) {
			buttonDisable = true;
			messageforKey = 'Key value is too short';
		} else {
			messageforKey = '';
		}
		if (totpName.length >= 1 && totpKey.length >= 16) {
			buttonDisable = false;
			messageforName = '';
			messageforKey = '';
		}
	}
</script>

<div class="text-center">
	<div class="wrapper responsiveWidth">
		<Section>
			<h3 style="text-align: center;" class="title">Add TOTP</h3>
			<div class="inputGroup">
				<Input
					bind:value={totpName}
					name="totpNameInput"
					inputType="text"
					placeholder="Accout name"
					minLength={1}
					on:nnsInput={validateInputName}
					autocomplete="off"
				>
					<svelte:fragment slot="label">Account name</svelte:fragment>
				</Input>
				{#if messageforName.length > 1}
					<p class="messageStyle">{messageforName}</p>
				{/if}
				<Input
					bind:value={totpKey}
					name="totpKeyInput"
					inputType="text"
					placeholder="Your key"
					minLength={16}
					on:nnsInput={validateInputKey}
					autocomplete="off"
				>
					<svelte:fragment slot="label">Your key</svelte:fragment>
				</Input>
				{#if messageforKey.length > 1}
					<p class="messageStyle">{messageforKey}</p>
				{/if}
				<button
					class="primary text-center"
					disabled={buttonDisable}
					on:click={async () => {
						await totpStore.addTOTP(totpKey, totpName);
						totpKey = '';
						totpName = '';
						// dispatchEvent(totpAddSubmit);
					}}>Add</button
				>
			</div>
		</Section>
	</div>
</div>

<style lang="scss" global>
	@use '@dfinity/gix-components/dist/styles/mixins/media';
	.inputGroup {
		display: flex;
		flex-direction: column;
		gap: 25px;
	}
	.text-center {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.wrapper {
		margin: var(--padding-2x) 0;
		& p,
		h3,
		h5 {
			margin: 0;
		}
		padding: 25px;
	}
	.title {
		padding-top: 0px;
		padding-bottom: 25px;
	}

	.messageStyle {
		color: #ea6c99;
	}

	.responsiveWidth {
		width: 100%;
	}

	@include media.min-width(small) {
		.responsiveWidth {
			width: 70%;
		}
	}

	@include media.min-width(medium) {
		.responsiveWidth {
			width: 55%;
		}
	}
	@include media.min-width(large) {
		.responsiveWidth {
			width: 50%;
		}
	}
</style>
