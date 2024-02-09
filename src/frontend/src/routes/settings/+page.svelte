<script lang="ts">
	import { Input, IconQRCodeScanner, IconCheckCircle } from '@dfinity/gix-components';
</script>

<h3>Settings</h3>

<Input name="fdfd" placeholder="Input text" inputType="text" value="">
	<div slot="inner-end" class="container">
		<div class="padding"><IconQRCodeScanner /></div>
		<div class="padding"><IconCheckCircle /></div>
	</div>
</Input>

<style lang="scss">
	.padding {
		padding-left: 15px;
	}
	.container {
		display: flex;
		align-items: center;
	}
</style>
