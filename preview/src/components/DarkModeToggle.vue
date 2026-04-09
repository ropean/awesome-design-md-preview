<script setup lang="ts">
import { useDarkMode } from '../composables/useDarkMode'
import SvgIcon from './SvgIcon.vue'
const { isDark, toggleDark } = useDarkMode()
</script>

<template>
  <button class="toggle" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleDark">
    <SvgIcon :name="isDark ? 'sun' : 'moon'" :size="16" />
  </button>
</template>

<style scoped>
.toggle {
  background: var(--color-bg-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 5px 14px;
  font-size: 0.9375rem;
  color: var(--color-text);
  cursor: pointer;
  transition: background 0.15s;
  line-height: 1;
}
.toggle:hover {
  background: var(--color-bg-4);
}
</style>
