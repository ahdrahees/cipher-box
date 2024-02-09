<script lang="ts">
    import Input from './Input.svelte'; // Adjust the path if needed
  
    export let name: string;
    export let value: string | number | undefined;
    export let placeholder: string;
    export let type = 'text'; // Default to text
    export let showPassword = false; // Toggle visibility
  </script>
  
  <button on:click={() => showPassword = !showPassword}>
    {#if showPassword}Hide{:else}Show{/if}
  </button>
  <Input
    name={name}
    value={value}
    placeholder={placeholder}
    inputType={showPassword ? 'password' : type} // Dynamically set inputType
    on:blur={() => showPassword = false} // Hide password on blur
    {...$$restProps} // Pass through other props
  />
  