<script lang="ts">
	import { Segment, SegmentButton, IconAdd, IconLockClock } from '@dfinity/gix-components';
	import { totpStore } from '$lib/stores/totop.store';
	import AddTotp from '$lib/components/AddTotp/AddTotp.svelte';

	let firstSegmentId = Symbol();
	let secondSegmentId = Symbol();
	let selectedSegmentId = firstSegmentId;
</script>

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
	<h2>Page1</h2>
{:else if selectedSegmentId === secondSegmentId}
	<AddTotp />
{/if}

<style>
	.SegmentButtonChild {
		padding-left: 10px;
	}
	.segment {
		display: flex;
		justify-content: center;
	}
</style>
