<script setup lang="ts">
import { ref, computed } from 'vue'
import Fuse from 'fuse.js'
import themes from 'virtual:theme-data'
import { SITE_TITLE } from '../constants'
import ThemeCard from '../components/ThemeCard.vue'
import SearchBar from '../components/SearchBar.vue'
import CategoryNav from '../components/CategoryNav.vue'
import AlphabetNav from '../components/AlphabetNav.vue'

// ── State ──────────────────────────────────────────────────────────────────
const query = ref('')
const activeCategory = ref('all')
const activeLetter = ref('')

// ── Category order (matches README.md) ────────────────────────────────────
const CATEGORY_ORDER = [
  'AI & Machine Learning',
  'Developer Tools & Platforms',
  'Infrastructure & Cloud',
  'Design & Productivity',
  'Fintech & Crypto',
  'Enterprise & Consumer',
  'Car Brands',
]

// ── Fuse.js index (all themes, built once) ─────────────────────────────────
const fuse = new Fuse(themes, {
  keys: [
    { name: 'name', weight: 3 },
    { name: 'description', weight: 2 },
    { name: 'category', weight: 1 },
  ],
  threshold: 0.4,
  includeScore: true,
})

// ── Search-only filter (no category, no letter) ───────────────────────────
// Used for: category counts + available letter range
const searchFiltered = computed(() =>
  query.value.trim()
    ? fuse.search(query.value).map((r) => r.item)
    : [...themes],
)

// ── Category counts: driven by search only, unaffected by active category ──
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const t of searchFiltered.value) {
    counts[t.category] = (counts[t.category] ?? 0) + 1
  }
  return counts
})

// ── Search + category filter (no letter) ──────────────────────────────────
const baseFiltered = computed(() => {
  if (activeCategory.value === 'all') return searchFiltered.value
  return searchFiltered.value.filter((t) => t.category === activeCategory.value)
})

// ── Available letters for alphabet nav (derived from baseFiltered) ─────────
const availableLetters = computed(() => new Set(baseFiltered.value.map((t) => t.letter)))

// ── Final result (search + category + letter) ─────────────────────────────
const filteredThemes = computed(() => {
  if (!activeLetter.value) return baseFiltered.value
  return baseFiltered.value.filter((t) => t.letter === activeLetter.value)
})

// ── Toggle letter: clicking an active letter deselects it ─────────────────
function onLetterChange(letter: string) {
  // Clear letter filter if the selected letter is no longer in baseFiltered
  if (letter && !availableLetters.value.has(letter)) {
    activeLetter.value = ''
  }
}
</script>

<template>
  <div class="page">
    <!-- ── Hero ──────────────────────────────────────────────────────── -->
    <section class="hero">
      <h1 class="hero-title">{{ SITE_TITLE }}</h1>
      <p class="hero-sub">
        {{ themes.length }} DESIGN.md files from real products — drop one into your project and let your AI agent build UI that actually matches.
      </p>
    </section>

    <!-- ── Controls ──────────────────────────────────────────────────── -->
    <div class="controls">
      <SearchBar v-model="query" />
      <CategoryNav
        :categories="CATEGORY_ORDER"
        :counts="categoryCounts"
        v-model="activeCategory"
      />
      <AlphabetNav
        :available="availableLetters"
        :total="availableLetters.size"
        v-model="activeLetter"
        @update:model-value="onLetterChange"
      />
    </div>

    <!-- ── Active filters + result count ────────────────────────────── -->
    <div class="results-bar" v-if="query || activeCategory !== 'all' || activeLetter">
      <span class="results-count">
        {{ filteredThemes.length }} result{{ filteredThemes.length !== 1 ? 's' : '' }}
      </span>
      <div class="filter-chips">
        <button v-if="query" class="chip" :aria-label="`Clear search: ${query}`" @click="query = ''">
          "{{ query }}" <span class="chip-x">✕</span>
        </button>
        <button v-if="activeCategory !== 'all'" class="chip" :aria-label="`Clear category: ${activeCategory}`" @click="activeCategory = 'all'">
          {{ activeCategory }} <span class="chip-x">✕</span>
        </button>
        <button v-if="activeLetter" class="chip" :aria-label="`Clear letter: ${activeLetter}`" @click="activeLetter = ''">
          Letter {{ activeLetter }} <span class="chip-x">✕</span>
        </button>
        <button
          v-if="(query ? 1 : 0) + (activeCategory !== 'all' ? 1 : 0) + (activeLetter ? 1 : 0) > 1"
          class="clear-all"
          @click="query = ''; activeCategory = 'all'; activeLetter = ''"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- ── Grid ──────────────────────────────────────────────────────── -->
    <main class="grid-wrap">
      <div v-if="filteredThemes.length" class="theme-grid">
        <ThemeCard
          v-for="theme in filteredThemes"
          :key="theme.id"
          :theme="theme"
        />
      </div>
      <div v-else class="empty-state">
        <p>No themes found<span v-if="query"> for "<strong>{{ query }}</strong>"</span>.</p>
        <button class="btn-reset" @click="query = ''; activeCategory = 'all'; activeLetter = ''">
          Reset filters
        </button>
      </div>
    </main>

  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Hero ───────────────────────────────────────────────────────────── */
.hero {
  text-align: center;
  padding: 56px 32px 40px;
  border-bottom: 1px solid var(--color-border);
}

.hero-title {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.hero-sub {
  font-size: 1rem;
  color: var(--color-text-2);
  max-width: 520px;
  margin: 0 auto;
}

/* ── Controls ───────────────────────────────────────────────────────── */
.controls {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 24px 32px 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ── Active filters bar ──────────────────────────────────────────────── */
.results-bar {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 6px 32px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.results-count {
  font-family: var(--font-display);
  font-size: 0.8125rem;
  color: var(--color-text-3);
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 12px;
  background: var(--color-bg-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-size: 0.8125rem;
  color: var(--color-text);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.chip:hover {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.chip-x {
  font-size: 0.6875rem;
  color: var(--color-text-3);
  flex-shrink: 0;
  line-height: 1;
}
.chip:hover .chip-x { color: var(--color-accent); }

.clear-all {
  font-family: var(--font-display);
  font-size: 0.8125rem;
  color: var(--color-text-2);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  padding: 3px 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.clear-all:hover { color: var(--color-accent); border-color: var(--color-accent); }

/* ── Grid ───────────────────────────────────────────────────────────── */
.grid-wrap {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 16px 32px 64px;
  flex: 1;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

/* ── Empty state ─────────────────────────────────────────────────────── */
.empty-state {
  text-align: center;
  padding: 80px 16px;
  color: var(--color-text-2);
  font-family: var(--font-display);
}

.empty-state p { margin-bottom: 16px; font-size: 1rem; }

.btn-reset {
  padding: 9px 20px;
  background: var(--color-bg-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-size: 0.875rem;
  color: var(--color-text);
  cursor: pointer;
}
.btn-reset:hover { background: var(--color-bg-4); }

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero { padding: 36px 16px 28px; }
  .controls { padding: 16px 16px 8px; }
  .results-info { padding: 6px 16px; }
  .grid-wrap { padding: 12px 16px 48px; }
  .theme-grid { grid-template-columns: 1fr; gap: 14px; }
}
</style>
