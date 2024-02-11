<script lang="ts">
	import { Segment, SegmentButton, IconAdd, IconLockClock } from '@dfinity/gix-components';
	import AddTotp from '$lib/components/AddTotp/AddTotp.svelte';
	import { onMount } from 'svelte';
	import { totpStore } from '$lib/stores/totop.store';

	import CardTotp from '$lib/components/CardTotp/CardTotp.svelte';
	import ProgressBarTotp from '$lib/components/ProgressBarTotp/ProgressBarTotp.svelte';
	import { authStore } from '$lib/auth.store';

	let firstSegmentId = Symbol();
	let secondSegmentId = Symbol();
	$: selectedSegmentId = secondSegmentId;

	async function waitForFetch() {
		if ($totpStore.encryptedTotps.length === 0 && $authStore.isAuthenticated) {
			await totpStore.fetchTOTP();
		} else {
		}
	}

	onMount(() => {
		setTimeout(() => {
			selectedSegmentId = firstSegmentId;
		}, 20);
	});
</script>

<!-- {#await waitForFetch() then _} -->
<div class="segment">
	<Segment bind:selectedSegmentId>
		<SegmentButton segmentId={firstSegmentId}
			><div class="SegmentButtonChild"><IconLockClock /></div>
		</SegmentButton>
		<SegmentButton segmentId={secondSegmentId}
			><div class="SegmentButtonChild"><IconAdd /></div>
		</SegmentButton>
	</Segment>
</div>

{#if selectedSegmentId === firstSegmentId}
	<ProgressBarTotp />
	{#each $totpStore.decryptedTotps as totps}
		<CardTotp decryptedTotp={totps} />
	{/each}
{:else if selectedSegmentId === secondSegmentId}
	<AddTotp />
{/if}

<!-- {/await} -->

<style lang="scss" global>
	.SegmentButtonChild {
		padding-left: 10px;
	}
	.segment {
		display: flex;
		justify-content: center;
	}
	.progressCenter {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
