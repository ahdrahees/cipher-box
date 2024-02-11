<script lang="ts">
	import { Section } from '@dfinity/gix-components';
	import { encryptionKey } from '$lib/stores/encryption-key.store';
	import { passwordStore } from '$lib/stores/password.store';

	import IconEyeSlash from '$lib/icon/IconEyeSlash.svelte';
	import IconEye from '$lib/icon/IconEye.svelte';
	import { Modal, Checkbox, InputRange, IconReimbursed, IconCheck } from '@dfinity/gix-components';

	import Input from '../Input/Input.svelte';

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

	let showPassword = false;

	let visible = false;

	let passwordLength: number = 12;
	let includeLowercase: boolean = true;
	let includeUppercase: boolean = true;
	let includeNumbers: boolean = true;
	let includeSymbols: boolean = true;

	let generatedPassword = '';

	function generatePassword() {
		type CharSet = 'lowercase' | 'uppercase' | 'number' | 'symbol';

		let availableChars: CharSet[] = [];

		if (includeLowercase) {
			availableChars.push('lowercase');
		}

		if (includeUppercase) {
			availableChars.push('uppercase');
		}

		if (includeNumbers) {
			availableChars.push('number');
		}

		if (includeSymbols) {
			availableChars.push('symbol');
		}

		// Ensure at least one character set is included
		if (!availableChars.length) {
			throw new Error('At least one character set must be included.');
		}

		// Filter out undefined values and convert to string arrays for password generation
		const chosenCharSets = availableChars.filter(Boolean) as CharSet[];
		const charArrays: string[][] = chosenCharSets.map((set) => {
			switch (set) {
				case 'lowercase':
					return 'abcdefghijklmnopqrstuvwxyz'.split('');
				case 'uppercase':
					return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
				case 'number':
					return '0123456789'.split('');
				case 'symbol':
					return "!@#$%^&*()_+-=[]{}|;:',.<>?/".split('');
				default:
					throw new Error('Invalid character set');
			}
		});

		const flatCharArray = charArrays.flat();

		const password_ = Array(passwordLength)
			.fill(0)
			.map(() => flatCharArray[Math.floor(Math.random() * flatCharArray.length)])
			.join('');

		generatedPassword = password_;
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
					inputType={showPassword ? 'text' : 'password'}
					placeholder="Password"
					minLength={1}
					autocomplete="off"
				>
					<svelte:fragment slot="label">Password *</svelte:fragment>

					<div class="flex-center" slot="inner-end">
						{#if showPassword}
							<button on:click={() => (showPassword = !showPassword)}><IconEyeSlash /></button>
						{:else}
							<button on:click={() => (showPassword = !showPassword)}><IconEye /></button>
						{/if}
						<button
							on:click={() => {
								visible = true;
								generatePassword();
							}}
						>
							<IconReimbursed />
						</button>
					</div>
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

<Modal role="alert" {visible} on:nnsClose={() => (visible = false)}>
	<svelte:fragment slot="title">Generator</svelte:fragment>

	<Input
		bind:value={generatedPassword}
		name="username-input"
		inputType="text"
		placeholder="Username"
		minLength={1}
		autocomplete="off"
	>
		<button slot="inner-end" on:click={generatePassword}>
			<IconReimbursed />
		</button>
	</Input>
	<h3 style="text-align: center; padding-top: 5px ">Options</h3>

	<div class="inputrange-row">
		<div>Length : {passwordLength}</div>
		<!-- <div style="padding-top: 1px;"> -->
		<InputRange
			ariaLabel="password length"
			min={5}
			max={128}
			bind:value={passwordLength}
			handleInput={generatePassword}
		/>
		<!-- </div> -->
	</div>
	<Checkbox
		inputId="Uppercase"
		checked={includeUppercase}
		on:nnsChange={() => {
			includeUppercase = !includeUppercase;
			generatePassword();
		}}
		>Uppercase A-Z
	</Checkbox>

	<Checkbox
		inputId="Lowercase"
		checked={includeLowercase}
		on:nnsChange={() => {
			includeLowercase = !includeLowercase;
			generatePassword();
		}}
		>Lowercase a-z
	</Checkbox>
	<Checkbox
		inputId="Numbers-pass"
		checked={includeNumbers}
		on:nnsChange={() => {
			includeNumbers = !includeNumbers;
			generatePassword();
		}}
		>Numbers 0-9
	</Checkbox>

	<Checkbox
		inputId="Numbers-pass"
		checked={includeSymbols}
		on:nnsChange={() => {
			includeSymbols = !includeSymbols;
			generatePassword();
		}}
		>{"Symbol !@#$%^&*()_+-=[]{}|;:',.<>?/"}
	</Checkbox>

	<svelte:fragment slot="footer">
		<button
			class="secondary"
			on:click={() => {
				pass = generatedPassword;
				visible = false;
				validateInputPass();
			}}><IconCheck /></button
		>
	</svelte:fragment>
</Modal>

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

	.inputrange-row {
		display: grid;
		grid-template-columns: 2fr 5fr;
		padding: 16px;
		border: 1.364px;
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
