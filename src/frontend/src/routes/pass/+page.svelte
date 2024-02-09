<script lang="ts">
	import AddPassword from '$lib/components/AddPassword/AddPassword.svelte';
	import { IconAdd, Segment, SegmentButton, IconPassword } from '@dfinity/gix-components';

	let firstSegmentId = Symbol();
	let secondSegmentId = Symbol();
	let selectedSegmentId = firstSegmentId;
</script>

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
	<h2>Hi how are you</h2>
{:else if selectedSegmentId === secondSegmentId}
	<AddPassword />
{/if}

<style lang="scss">
	.segment {
		display: flex;
		justify-content: center;
	}
	.SegmentButtonChild {
		padding-left: 10px;
	}
</style>
