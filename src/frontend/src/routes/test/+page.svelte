<script lang="ts">
	import {
		Section,
		Card,
		Modal,
		Copy,
		toastsStore,
		IconCopy,
		Toasts
	} from '@dfinity/gix-components';
	import { encryptionKey } from '$lib/stores/encryption-key.store';
	import { passwordStore } from '$lib/stores/password.store';
	import Input from '$lib/components/Input/Input.svelte';
	import IconEye from '$lib/icon/IconEye.svelte';
	import IconEyeSlash from '$lib/icon/IconEyeSlash.svelte';

	// export let decryptedPass: {
	// 	id: bigint;
	// 	url: string;
	// 	username: string;
	// 	name: string;
	// 	pass: string;
	// };
	let name = 'Instagram';
	let username = 'vanmaram';
	let url = 'google.com';
	let pass = 'DJKS#34nadf)$2';

	let visible = false;

	let buttonDisable = true;
	let messageforName = '';
	let messageforPass = '';

	let inputDisable = true;

	let showPassword = false;

	function validateInputName() {
		if ($encryptionKey === null) {
			messageforPass = 'No symmetric key to encrypt';
		}
		if (name.length < 1) {
			buttonDisable = true;
			messageforName = 'Enter a name for this password';
		} else {
			messageforName = '';
		}

		if (name.length >= 1 && pass.length >= 1) {
			buttonDisable = false;
			messageforName = '';
			messageforPass = '';
		}
	}

	function validateInputPass() {
		if ($encryptionKey === null) {
			messageforPass = 'No symmetric key to encrypt';
		}
		if (pass.length < 1) {
			buttonDisable = true;
			messageforPass = 'Please enter password';
		} else {
			messageforPass = '';
		}

		if (name.length >= 1 && pass.length >= 1) {
			buttonDisable = false;
			messageforName = '';
			messageforPass = '';
		}
	}

	function copyValue(value: string) {
		navigator.clipboard
			.writeText(value)
			.then(() => {
				toastsStore.show({ text: 'Copied!', level: 'success', duration: 3000 });
			})
			.catch((err) => {
				toastsStore.show({ text: 'Failed to copy:' + err, level: 'error' });
				console.error('Failed to copy:', err);
			});
	}
</script>

<Card
	role="button"
	theme="framed"
	noPadding
	ariaLabel={name + ' ' + username}
	on:click={() => (visible = true)}
>
	<div class="card-padding">
		<h3 class="font-size-medium">{name}</h3>
		<p class="font-size-small">{username}</p>
	</div>
</Card>

<Modal {visible} on:nnsClose={() => (visible = false)}>
	<svelte:fragment slot="title">Info</svelte:fragment>

	<div class="input-group">
		<Input
			on:nnsInput={validateInputName}
			bind:value={name}
			name="name-input"
			inputType="text"
			placeholder="Name"
			minLength={1}
			disabled={inputDisable}
		>
			<svelte:fragment slot="label">Name</svelte:fragment>
		</Input>
		<!-- {#if messageforName.length > 1}
			<p class="messageStyle">{messageforName}</p>
		{/if} -->
		<Input
			bind:value={username}
			name="username-input"
			inputType="text"
			placeholder="Username"
			minLength={1}
			disabled={inputDisable}
		>
			<svelte:fragment slot="label">Username</svelte:fragment>
			<button slot="inner-end" on:click={() => copyValue(username)}>
				<div class="popoverMenuButton"><IconCopy /></div>
			</button>
		</Input>
		<Input
			on:nnsInput={validateInputPass}
			bind:value={pass}
			name="password-input"
			inputType={showPassword ? 'text' : 'password'}
			placeholder="Password"
			minLength={1}
			disabled={inputDisable}
		>
			<svelte:fragment slot="label">Password</svelte:fragment>
			<div class="container" slot="inner-end">
				{#if showPassword}
					<button on:click={() => (showPassword = !showPassword)}><IconEyeSlash /></button>
				{:else}
					<button on:click={() => (showPassword = !showPassword)}><IconEye /></button>
				{/if}
				<button on:click={() => copyValue(pass)}>
					<div class="popoverMenuButton"><IconCopy /></div>
				</button>
			</div>
		</Input>
		<!-- {#if messageforPass.length > 1}
			<p class="messageStyle">{messageforPass}</p>
		{/if} -->
		<Input
			bind:value={url}
			name="url-input"
			inputType="text"
			placeholder="URL"
			minLength={1}
			disabled={inputDisable}
		>
			<svelte:fragment slot="label">URL</svelte:fragment>
		</Input>
	</div>
	<Toasts />
</Modal>

<style lang="scss">
	.font-size-medium {
		font-size: medium;
	}
	.font-size-small {
		font-size: small;
	}
	.card-padding {
		padding-top: 5px;
		padding-left: 15px;
	}
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.container {
		display: flex;
		align-items: center;
	}
</style>
