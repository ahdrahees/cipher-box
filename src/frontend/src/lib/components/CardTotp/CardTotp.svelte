<script lang="ts">
	import {
		Card,
		Modal,
		IconCopy,
		IconSettings,
		toastsStore,
		Popover,
		Input
	} from '@dfinity/gix-components';
	import IconDelete from '$lib/icon/IconDelete.svelte';
	import IconEdit from '$lib/icon/IconEdit.svelte';
	import * as OTP from 'one-time-password';
	import { onMount, onDestroy } from 'svelte';
	import { totpStore } from '$lib/stores/totop.store';

	export let decryptedTotp: {
		id: bigint;
		key: string;
		name: string;
	};
	let totpKey = decryptedTotp?.key;
	let totpName = decryptedTotp?.name;
	let totpToken = OTP.generate(totpKey);

	let visible = false;
	let button;

	let intervalId: any; // ID for the setInterval timer
	let maxValue = 30; // Maximum progress value
	let leftSecsForUpdate = 30 - Math.floor((Date.now() / 1000) % maxValue);

	function updateToken() {
		totpToken = OTP.generate(totpKey);
	}

	onMount(() => {
		intervalId = setTimeout(() => {
			updateToken();
			intervalId = setInterval(updateToken, 30 * 1000); // Update every 30 second
		}, leftSecsForUpdate * 1000);
	});

	onDestroy(() => {
		clearInterval(intervalId); // Stop the timer on component destruction
	});

	function copyTotpToken() {
		navigator.clipboard
			.writeText(totpToken.toString())
			.then(() => {
				toastsStore.show({ text: 'Copied!', level: 'success', duration: 3000 });
			})
			.catch((err) => {
				toastsStore.show({ text: 'Failed to copy:' + err, level: 'error' });
				console.error('Failed to copy:', err);
			});
	}

	let visibleEditModal = false;

	//////

	let buttonDisable = true;
	let messageforName = '';
	let messageforKey = '';

	function validateInputName() {
		if ($totpStore === null) {
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
		if ($totpStore === null) {
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

<Card>
	<div class="cardChilds">
		<div>
			<button class="button-padding ghost" on:click={copyTotpToken}
				><h3 class="totpTokenStyle hoverOverStyle">{totpToken}</h3></button
			>

			<p class="totpNameStyle">{totpName}</p>
		</div>
		<div class="settingsMenuStyle">
			<button bind:this={button} on:click={() => (visible = !visible)}><IconSettings /></button>
		</div>
	</div>
</Card>

<Popover anchor={button} bind:visible direction="rtl">
	<div class="menuInfo">
		<button on:click={copyTotpToken}><div class="popoverMenuButton"><IconCopy /> Copy</div></button>
		<button
			on:click={() => {
				visibleEditModal = true;
				visible = false;
			}}><div class="popoverMenuButton"><IconEdit />Edit</div></button
		>
		<button on:click={async () => await totpStore.deleteTOTP(decryptedTotp.id)}
			><div class="popoverMenuButton"><IconDelete />Delete</div></button
		>
	</div>
</Popover>

<Modal visible={visibleEditModal} on:nnsClose={() => (visibleEditModal = false)}>
	<svelte:fragment slot="title">Edit</svelte:fragment>

	<div class="inputGroup">
		<Input
			bind:value={totpName}
			name="totpNameInput"
			inputType="text"
			placeholder="Accout name"
			minLength={1}
			on:nnsInput={validateInputName}
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
			><svelte:fragment slot="label">Your key</svelte:fragment>
		</Input>
		{#if messageforKey.length > 1}
			<p class="messageStyle">{messageforKey}</p>
		{/if}
		<button
			class="primary text-center"
			disabled={buttonDisable}
			on:click={async () => {
				await totpStore.updateTOTP({
					id: decryptedTotp.id,
					key: totpKey,
					name: totpName
				});

				visibleEditModal = false;
			}}>Edit</button
		>
	</div>
</Modal>

<style lang="scss">
	@use '@dfinity/gix-components/dist/styles/mixins/card';

	.cardChilds {
		display: grid;
		grid-template-columns: 4fr 1fr;
	}
	.totpTokenStyle {
		font-size: x-large;
		// font-family: Arial, Helvetica, sans-serif;
		letter-spacing: 0.2rem;
		// font-weight: bold;
	}
	.totpNameStyle {
		font-size: small;
	}
	.settingsMenuStyle {
		display: flex;
		align-items: end;
		flex-direction: column;
		justify-content: center;
		height: auto;
	}

	.hoverOverStyle {
		color: inherit;
		transition: color var(--animation-time-short) ease-in;

		text-decoration: none;
		outline: none;

		&:focus,
		&:hover {
			text-decoration: none;
		}

		&:focus,
		&:hover {
			color: var(--primary);
		}
	}
	.menuInfo {
		width: 100%;

		display: flex;
		flex-direction: column;
		gap: var(--padding-3x);
	}
	.button-padding {
		padding: 0px;
		height: 32px;
	}

	.popoverMenuButton {
		display: flex;
		flex-direction: row;
		justify-content: center;
		align-items: center;
		gap: 5px;
	}

	.inputGroup {
		display: flex;
		flex-direction: column;
		gap: 25px;
	}
	.messageStyle {
		color: #ea6c99;
	}
	.text-center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
