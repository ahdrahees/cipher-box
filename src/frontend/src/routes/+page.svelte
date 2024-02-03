<script lang="ts">
	import { busyStore } from '@dfinity/gix-components';

	function updateVariable() {
		busyStore.startBusy({
			initiator: 'just-making-screen-busy',
			text: 'You are in traffic jam bitch....'
		});
		setTimeout(() => {
			busyStore.startBusy({
				initiator: 'hang-on',
				text: 'Hang tight.. baby 😘'
			});

			setTimeout(() => {
				busyStore.stopBusy('just-making-screen-busy');
				busyStore.stopBusy('hang-on');
			}, 10000);
		}, 10000); // Delay in milliseconds
	}
</script>

<button class="primary" on:click={() => updateVariable()}> start Busy</button>

<h2>TOTPs Page</h2>
