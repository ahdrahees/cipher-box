<script>import { createEventDispatcher } from "svelte";
import { isNullish, nonNullish } from "@dfinity/utils";
export let name;
export let inputType = "number";
export let required = true;
export let spellcheck = void 0;
export let step = void 0;
export let disabled = false;
export let minLength = void 0;
export let max = void 0;
export let value = void 0;
export let placeholder;
export let testId = void 0;
const dispatch = createEventDispatcher();
export let autocomplete = void 0;
export let showInfo = true;
let inputElement;
$:
  step = inputType === "number" ? step ?? "any" : void 0;
$:
  autocomplete = inputType !== "number" ? autocomplete ?? "off" : void 0;
let selectionStart = 0;
let selectionEnd = 0;
const exponentToPlainNumberString = (value2) => (
  // number to toLocaleString doesn't support decimals for values >= ~1e16
  value2.includes("e") ? Number(value2).toLocaleString("en", {
    useGrouping: false,
    maximumFractionDigits: 8
  }) : value2
);
const fixUndefinedValue = (value2) => isNullish(value2) ? "" : `${value2}`;
let icpValue = exponentToPlainNumberString(fixUndefinedValue(value));
let lastValidICPValue = value;
let internalValueChange = true;
$:
  value, (() => {
    if (!internalValueChange && inputType === "icp") {
      if (typeof value === "number") {
        icpValue = exponentToPlainNumberString(`${value}`);
      } else {
        icpValue = fixUndefinedValue(value);
      }
      lastValidICPValue = icpValue;
    }
    internalValueChange = false;
  })();
const restoreFromValidValue = (noValue = false) => {
  if (isNullish(inputElement) || inputType !== "icp") {
    return;
  }
  if (noValue) {
    lastValidICPValue = void 0;
  }
  internalValueChange = true;
  value = isNullish(lastValidICPValue) ? void 0 : typeof lastValidICPValue === "number" ? lastValidICPValue.toFixed(8) : +lastValidICPValue;
  icpValue = fixUndefinedValue(lastValidICPValue);
  inputElement.value = icpValue;
  inputElement.setSelectionRange(selectionStart, selectionEnd);
};
const isValidICPFormat = (text) => /^[\d]*(\.[\d]{0,8})?$/.test(text);
const handleInput = ({ currentTarget }) => {
  if (inputType === "icp") {
    const currentValue = exponentToPlainNumberString(currentTarget.value);
    if (isValidICPFormat(currentValue) === false) {
      restoreFromValidValue();
    } else if (currentValue.length === 0) {
      restoreFromValidValue(true);
    } else {
      lastValidICPValue = currentValue;
      icpValue = fixUndefinedValue(currentValue);
      internalValueChange = true;
      value = +currentValue;
    }
  } else {
    internalValueChange = true;
    value = inputType === "number" ? +currentTarget.value : currentTarget.value;
  }
  dispatch("nnsInput");
};
const handleKeyDown = () => {
  if (isNullish(inputElement)) {
    return;
  }
  ({ selectionStart, selectionEnd } = inputElement);
};
$:
  step = inputType === "number" ? step ?? "any" : void 0;
$:
  autocomplete = inputType !== "number" && inputType !== "icp" ? autocomplete ?? "off" : void 0;
let displayInnerEnd;
$:
  displayInnerEnd = nonNullish($$slots["inner-end"]);
</script>

<div class="input-block" class:disabled>
  {#if showInfo}
    <div class="info">
      <slot name="start" />
      <label class="label" for={name}><slot name="label" /></label>
      <slot name="end" />
    </div>
  {/if}
  <div class="input-field">
    <input
      bind:this={inputElement}
      data-tid={testId}
      type={inputType === "icp" ? "text" : inputType}
      {required}
      {spellcheck}
      {name}
      id={name}
      {step}
      {disabled}
      value={inputType === "icp" ? icpValue : value}
      minlength={minLength}
      {placeholder}
      {max}
      {autocomplete}
      on:blur
      on:focus
      on:input={handleInput}
      on:keydown={handleKeyDown}
      class:inner-end={displayInnerEnd}
    />
    {#if displayInnerEnd}
      <div class="inner-end-slot">
        <slot name="inner-end" />
      </div>
    {/if}
  </div>
</div>

<style>.input-block {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--padding);
  width: var(--input-width);
  color: var(--background-contrast);
  background: none;
}
.input-block.disabled {
  --disabled-color: rgba(var(--disable-contrast-rgb), 0.8);
  color: var(--disabled-color);
}
.input-block.disabled input {
  border: var(--input-border-size) solid var(--disable);
  color: var(--disabled-color);
}

.info {
  display: flex;
  justify-content: space-between;
  gap: var(--padding);
}
.info .label {
  flex: 1 1 100%;
}

input {
  background: var(--input-background);
  color: var(--input-background-contrast);
  border: var(--input-border-size) solid var(--input-error-color, var(--input-custom-border-color, var(--input-border-color)));
  transition: color var(--animation-time-short) ease-out, background var(--animation-time-short) ease-out, border var(--animation-time-short) ease-in;
  width: 100%;
  font-size: inherit;
  padding: var(--padding-2x);
  box-sizing: border-box;
  border-radius: var(--border-radius);
  outline: none;
  appearance: none;
}
input:focus {
  border: var(--input-border-size) solid var(--secondary);
  background: var(--focus-background);
  color: var(--focus-background-contrast);
}
input::placeholder {
  color: var(--disable-contrast);
}

input[disabled] {
  cursor: text;
}

.input-field {
  position: relative;
}

.inner-end {
  padding-right: var(--input-padding-inner-end, 64px);
}

.inner-end-slot {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(0, -50%);
  padding: var(--padding) var(--padding-2x);
}</style>
