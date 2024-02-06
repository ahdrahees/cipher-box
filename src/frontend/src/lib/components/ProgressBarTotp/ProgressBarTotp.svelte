<script lang="ts">
	import { ProgressBar } from '@dfinity/gix-components';
	import { onMount, onDestroy } from 'svelte';

	let maxValue = 30; // Maximum progress value
	let value = Math.floor((Date.now() / 1000) % maxValue);
	let intervalId: any; // ID for the setInterval timer

	function updateProgress() {
		if (value < maxValue) {
			value++;
		} else {
			value = 0;
		}
	}

	onMount(() => {
		intervalId = setInterval(updateProgress, 1000); // Update every second
	});

	onDestroy(() => {
		clearInterval(intervalId); // Stop the timer on component destruction
	});
</script>

<!-- <div class="card-grid"> -->
<ProgressBar color={value > 25 ? 'warning' : 'primary'} {value} max={maxValue} />
<!-- </div> -->

<!-- <h2>{value + ' s'}</h2>
<h2>{'Next in' + (30 - value) + ' s'}</h2> -->
