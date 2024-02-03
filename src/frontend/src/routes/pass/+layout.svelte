<script lang="ts">
	import { SplitContent, HeaderTitle, Nav, Card, ThemeToggle } from '@dfinity/gix-components';

	let array = [
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green',
		'Orange',
		'Purple',
		'Red',
		'Green'
	];
</script>

<!-- <SplitContent>
	<div slot="start">
		<Nav>
			<h3 slot="title">Pick a component</h3>

			{#each array as element}
				<Card><h2 slot="start">{element}</h2></Card>
			{/each}
		</Nav>
	</div>

	<HeaderTitle slot="title">My dapp page</HeaderTitle>
	<ThemeToggle slot="toolbar-end" />
	<main slot="end"> -->
<slot />
<!-- </main>
</SplitContent> -->
