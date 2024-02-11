<script lang="ts">
	import { authStore } from '$lib/auth.store';
	import AddPassword from '$lib/components/AddPassword/AddPassword.svelte';
	import CardPassword from '$lib/components/CardPassword/CardPassword.svelte';
	import { passwordStore, type DecryptedPasswords } from '$lib/stores/password.store';
	import {
		IconAdd,
		Segment,
		SegmentButton,
		IconPassword,
		IconClose
	} from '@dfinity/gix-components';
	import Input from '$lib/components/Input/Input.svelte';
	import { writable } from 'svelte/store';
	import { tick } from 'svelte';

	let firstSegmentId = Symbol();
	let secondSegmentId = Symbol();
	$: selectedSegmentId = firstSegmentId;

	async function waitForPassword() {
		if ($passwordStore.encryptedPasswords.length === 0 && $authStore.isAuthenticated) {
			await passwordStore.fetchPass();
		} else {
		}
		// selectedSegmentId = secondSegmentId;
		// selectedSegmentId = firstSegmentId;
	}

	let searchResult = writable<DecryptedPasswords>([]);

	async function searchPasswords() {
		let passwords = $passwordStore.decryptedPasswords;
		const lowerSearchText = searchText.toLowerCase();

		searchResult.set(
			passwords.filter((password) => {
				const lowerUrl = password.url.toLowerCase();
				const lowerUsername = password.username.toLowerCase();
				const lowerName = password.name.toLowerCase();
				return (
					lowerUrl.includes(lowerSearchText) ||
					lowerUsername.includes(lowerSearchText) ||
					lowerName.includes(lowerSearchText)
				);
			})
		);

		await tick(); // Wait for Svelte to update the DOM
	}

	$: searchText = '';

	let searchMode: boolean = false;

	$: searchText === '' ? (searchMode = false) : (searchMode = true);
</script>

{#await waitForPassword() then _}
	<div class="segment">
		<Segment bind:selectedSegmentId>
			<SegmentButton segmentId={firstSegmentId}
				><div class="SegmentButtonChild"><IconPassword /></div></SegmentButton
			>
			<SegmentButton segmentId={secondSegmentId}
				><div class="SegmentButtonChild"><IconAdd /></div></SegmentButton
			>
		</Segment>
	</div>

	{#if selectedSegmentId === firstSegmentId}
		<Input
			on:nnsInput={async () => {
				await searchPasswords();
				setTimeout(async () => await searchPasswords(), 500);
			}}
			bind:value={searchText}
			name="search"
			inputType="text"
			placeholder="Search"
		>
			<button slot="inner-end" on:click={() => (searchText = '')}><IconClose /></button></Input
		>

		{#if searchMode || searchText !== ''}
			{#each $searchResult as decryptedPass}
				<CardPassword {decryptedPass} />
			{/each}
		{:else}
			{#each $passwordStore.decryptedPasswords as decryptedPass}
				<CardPassword {decryptedPass} />
			{/each}
		{/if}
	{:else if selectedSegmentId === secondSegmentId}
		<AddPassword />
	{/if}
{/await}

<style lang="scss">
	.segment {
		display: flex;
		justify-content: center;
	}
	.SegmentButtonChild {
		padding-left: 10px;
	}
</style>
