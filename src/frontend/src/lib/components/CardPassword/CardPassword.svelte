<script lang="ts">
	import {
		Card,
		Modal,
		toastsStore,
		IconCopy,
		Toasts,
		IconClose,
		Checkbox,
		InputRange,
		IconReimbursed,
		IconCheck
	} from '@dfinity/gix-components';
	import { encryptionKey } from '$lib/stores/encryption-key.store';
	import { passwordStore } from '$lib/stores/password.store';
	import Input from '$lib/components/Input/Input.svelte';
	import IconEye from '$lib/icon/IconEye.svelte';
	import IconEyeSlash from '$lib/icon/IconEyeSlash.svelte';
	import IconSave from '$lib/icon/IconSave.svelte';
	import IconEdit from '$lib/assets/IconEdit.svelte';
	import IconDelete from '$lib/icon/IconDelete.svelte';

	export let decryptedPass: {
		id: bigint;
		url: string;
		username: string;
		name: string;
		pass: string;
	};
	let name = decryptedPass.name;
	let username = decryptedPass.username;
	let url = decryptedPass.url;
	let pass = decryptedPass.pass;

	let visible = false;

	let buttonDisable = true;
	let messageforName = '';
	let messageforPass = '';

	$: editMode = false;

	$: inputDisable = editMode ? false : true;

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

		validateInputChange();
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

		validateInputChange();
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

	function cancel() {
		editMode = false;
		name = decryptedPass.name;
		username = decryptedPass.username;
		url = decryptedPass.url;
		pass = decryptedPass.pass;

		messageforName = '';
		messageforPass = '';
	}

	function validateInputChange() {
		if (
			decryptedPass.name !== name ||
			decryptedPass.pass !== pass ||
			decryptedPass.url !== url ||
			decryptedPass.username !== username
		) {
			buttonDisable = false;
		} else {
			buttonDisable = true;
		}
	}

	/// Generate password
	let visibleGenerate = false;

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

<Modal
	{visible}
	on:nnsClose={() => {
		visible = false;
		editMode = false;
	}}
>
	<svelte:fragment slot="title">{editMode ? 'Edit' : 'Info'}</svelte:fragment>

	<div class="input-group">
		<Input
			on:nnsInput={validateInputName}
			bind:value={name}
			name="name-input"
			inputType="text"
			placeholder="Name"
			minLength={1}
			disabled={inputDisable}
			autocomplete="off"
		>
			<svelte:fragment slot="label">Name</svelte:fragment>
		</Input>
		{#if messageforName.length > 1 && editMode}
			<p class="messageStyle">{messageforName}</p>
		{/if}
		<Input
			on:nnsInput={validateInputChange}
			bind:value={username}
			name="username-input"
			inputType="text"
			placeholder="Username"
			minLength={1}
			disabled={inputDisable}
			autocomplete="off"
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
			autocomplete="off"
		>
			<svelte:fragment slot="label">Password</svelte:fragment>
			<div class="container" slot="inner-end">
				{#if showPassword}
					<button on:click={() => (showPassword = !showPassword)}><IconEyeSlash /></button>
				{:else}
					<button on:click={() => (showPassword = !showPassword)}><IconEye /></button>
				{/if}
				{#if !editMode}
					<button on:click={() => copyValue(pass)}>
						<div class="popoverMenuButton"><IconCopy /></div>
					</button>
				{:else}
					<button
						on:click={() => {
							visibleGenerate = true;
							generatePassword();
						}}
					>
						<IconReimbursed />
					</button>
				{/if}
			</div>
		</Input>
		{#if messageforPass.length > 1 && editMode}
			<p class="messageStyle">{messageforPass}</p>
		{/if}
		<Input
			on:nnsInput={validateInputChange}
			bind:value={url}
			name="url-input"
			inputType="text"
			placeholder="URL"
			minLength={1}
			disabled={inputDisable}
			autocomplete="off"
		>
			<svelte:fragment slot="label">URL</svelte:fragment>
		</Input>
	</div>
	<div class="container-spacebtw">
		{#if !editMode}
			<button class="secondary" on:click={() => (editMode = !editMode)}><IconEdit /></button>
		{:else}
			<div class="container-gap">
				<button
					class="secondary"
					disabled={buttonDisable}
					on:click={async () => {
						await passwordStore.updatePass({ id: decryptedPass.id, name, username, pass, url });
						editMode = false;
					}}><IconSave /></button
				>

				<button class="secondary" on:click={cancel}><IconClose /></button>
			</div>
		{/if}

		<button
			class="secondary"
			on:click={async () => {
				await passwordStore.deletePass(decryptedPass.id);
				visible = false;
			}}
		>
			<IconDelete /></button
		>
	</div>

	<Toasts />
</Modal>

<Modal role="alert" visible={visibleGenerate} on:nnsClose={() => (visibleGenerate = false)}>
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
				visibleGenerate = false;
				validateInputPass();
			}}><IconCheck /></button
		>
	</svelte:fragment>
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
	.container-spacebtw {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 16px;
	}
	.container-gap {
		display: flex;
		gap: 16px;
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
</style>
