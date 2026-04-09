<script setup lang="ts">
defineProps<{
  categories: string[]
  counts: Record<string, number>
}>()

const model = defineModel<string>({ default: 'all' })
</script>

<template>
  <nav class="cat-nav" role="tablist" aria-label="Filter by category">
    <!-- All: standalone, does not participate in the wrap group -->
    <button
      role="tab"
      :aria-selected="model === 'all'"
      :class="['tab', { active: model === 'all' }]"
      @click="model = 'all'"
    >
      All
      <span class="count">{{ Object.values(counts).reduce((a, b) => a + b, 0) }}</span>
    </button>

    <!-- Category tabs: wrap group, second line aligns to the first category -->
    <div class="cat-tabs-wrap">
      <button
        v-for="cat in categories"
        :key="cat"
        role="tab"
        :aria-selected="model === cat"
        :class="['tab', { active: model === cat }]"
        @click="model = cat"
      >
        {{ cat }}
        <span class="count">{{ counts[cat] ?? 0 }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.cat-nav {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 4px 0;
}

/* Category wrap group: second line left-aligns to the start of this group */
.cat-tabs-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--color-border);
  background: var(--color-bg-2);
  font-family: var(--font-display);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-2);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.tab:hover {
  background: var(--color-bg-3);
  color: var(--color-text);
}

.tab.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.count {
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-pill);
  padding: 1px 6px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tab:not(.active) .count {
  background: var(--color-bg-3);
  color: var(--color-text-3);
}
</style>
