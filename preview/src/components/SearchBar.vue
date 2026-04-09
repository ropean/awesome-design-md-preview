<script setup lang="ts">
import SvgIcon from './SvgIcon.vue'
const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="search-wrap">
    <SvgIcon name="search" :size="18" class="icon" />
    <input
      v-model="model"
      type="search"
      placeholder="Search design systems…"
      class="search-input"
      autocomplete="off"
      spellcheck="false"
    />
    <button v-if="model" class="clear" aria-label="Clear" @click="model = ''">
      <SvgIcon name="x" :size="14" />
    </button>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 14px;
  color: var(--color-text-3);
  font-size: 1.125rem;
  pointer-events: none;
  line-height: 1;
}

.search-input {
  width: 100%;
  padding: 11px 40px 11px 42px;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-size: 0.9375rem;
  color: var(--color-text);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  -webkit-appearance: none;
}

.search-input::placeholder {
  color: var(--color-text-3);
}

.search-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(245, 78, 0, 0.12);
}

/* Remove native clear button */
.search-input::-webkit-search-cancel-button { display: none; }

.clear {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: var(--color-text-3);
  font-size: 0.875rem;
  cursor: pointer;
  padding: 2px 4px;
  line-height: 1;
}
.clear:hover { color: var(--color-text); }
</style>
