<script setup lang="ts">
defineProps<{
  available: Set<string>  // letters present in the current filtered result set
  total: number           // total themes available (shown on the All button)
}>()

const model = defineModel<string>({ default: '' })

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
</script>

<template>
  <nav class="alpha-nav" aria-label="Filter by letter">
    <!-- All: reset button -->
    <button
      :class="['letter', 'all-btn', { active: model === '' }]"
      aria-label="Show all letters"
      @click="model = ''"
    >
      All
      <span class="alpha-count">{{ total }}</span>
    </button>
    <span class="divider" aria-hidden="true" />
    <!-- A–Z -->
    <button
      v-for="letter in LETTERS"
      :key="letter"
      :disabled="!available.has(letter)"
      :class="['letter', { active: model === letter, empty: !available.has(letter) }]"
      :aria-label="`Filter by ${letter}`"
      @click="model = model === letter ? '' : letter"
    >
      {{ letter }}
    </button>
  </nav>
</template>

<style scoped>
.alpha-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.divider {
  width: 1px;
  height: 18px;
  background: var(--color-border);
  margin: 0 4px;
  flex-shrink: 0;
}

.letter {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-2);
  cursor: pointer;
  transition: all 0.12s;
  padding: 0;
  width: 30px;
}

.all-btn {
  width: auto;
  padding: 0 10px;
  font-size: 0.75rem;
  gap: 4px;
}

.alpha-count {
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-pill);
  padding: 1px 6px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.all-btn:not(.active) .alpha-count {
  background: var(--color-bg-3);
  color: var(--color-text-3);
}

.letter:hover:not(:disabled):not(.active) {
  background: var(--color-bg-3);
  color: var(--color-text);
}

.letter.active {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.letter.empty {
  color: var(--color-text-3);
  cursor: default;
  opacity: 0.4;
}
</style>
