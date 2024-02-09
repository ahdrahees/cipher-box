<script lang="ts">
	import { Section, Input } from '@dfinity/gix-components';
	import { encryptionKey } from '$lib/stores/encryption-key.store';
	import { passwordStore } from '$lib/stores/password.store';

	let name: string = '';
	let username: string = '';
	let pass: string = '';
	let url: string = '';

	let buttonDisable = true;
	let messageforName = '';
	let messageforPass = '';

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
</script>

<div class="flex-center">
	<div class="responsiveWidth flex-center">
		<Section>
			<h3 style="text-align: center;" class="title">Add password</h3>
			<div class="input-group">
				<Input
					on:nnsInput={validateInputName}
					bind:value={name}
					name="name-input"
					inputType="text"
					placeholder="Name"
					minLength={1}
					autocomplete="off"
				>
					<svelte:fragment slot="label">Name *</svelte:fragment>
				</Input>
				{#if messageforName.length > 1}
					<p class="messageStyle">{messageforName}</p>
				{/if}
				<Input
					bind:value={username}
					name="username-input"
					inputType="text"
					placeholder="Username"
					minLength={1}
					autocomplete="off"
				>
					<svelte:fragment slot="label">Username</svelte:fragment>
				</Input>
				<Input
					on:nnsInput={validateInputPass}
					bind:value={pass}
					name="password-input"
					inputType="text"
					placeholder="Password"
					minLength={1}
					autocomplete="off"
				>
					<svelte:fragment slot="label">Password *</svelte:fragment>
				</Input>
				{#if messageforPass.length > 1}
					<p class="messageStyle">{messageforPass}</p>
				{/if}
				<Input
					bind:value={url}
					name="url-input"
					inputType="text"
					placeholder="URL"
					minLength={1}
					autocomplete="off"
				>
					<svelte:fragment slot="label">URL</svelte:fragment>
				</Input>
				<div class="buttonAddStyle">
					<button
						class="primary full-width flex-center"
						disabled={buttonDisable}
						on:click={async () => {
							await passwordStore.addPass({ url, username, name, pass });
							name = '';
							username = '';
							pass = '';
							url = '';
						}}>Add</button
					>
				</div>
			</div>
		</Section>
	</div>
</div>

<style lang="scss">
	@use '@dfinity/gix-components/dist/styles/mixins/media';

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.flex-center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.buttonAddStyle {
		padding-top: 15px;
		text-align: center;
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
