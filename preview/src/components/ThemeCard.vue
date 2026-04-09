<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ThemeCard } from '../types'
import { useDarkMode } from '../composables/useDarkMode'
import SvgIcon from './SvgIcon.vue'

const props = defineProps<{ theme: ThemeCard }>()

const { isDark } = useDarkMode()

const imgError = ref(false)
const imgSrc = computed(() =>
  isDark.value ? props.theme.thumbnailDarkUrl : props.theme.thumbnailUrl,
)
watch(isDark, () => { imgError.value = false })
function onImgError() { imgError.value = true }
</script>

<template>
  <a class="card" :href="`/themes/${theme.id}/`">
    <!-- Thumbnail -->
    <div class="card-thumb">
      <img
        v-if="!imgError"
        :src="imgSrc"
        :alt="`${theme.name} preview`"
        loading="lazy"
        class="thumb-img"
        @error="onImgError"
      />
      <img
        v-else
        src="/placeholder.svg"
        :alt="`${theme.name} placeholder`"
        class="thumb-img placeholder"
      />
    </div>

    <!-- Card body -->
    <div class="card-body">
      <div class="card-header">
        <h3 class="card-title">{{ theme.name }}</h3>
        <span class="card-cat">{{ theme.category }}</span>
      </div>

      <p class="card-desc" v-html="theme.descriptionHtml" />

      <div class="card-links">
        <a :href="theme.previewUrl"     target="_blank" rel="noopener" data-tooltip="Light preview" class="link-icon" @click.stop><SvgIcon name="sun"       :size="16" /></a>
        <a :href="theme.previewDarkUrl" target="_blank" rel="noopener" data-tooltip="Dark preview"  class="link-icon" @click.stop><SvgIcon name="moon"      :size="16" /></a>
        <a :href="theme.designPageUrl"  target="_blank" rel="noopener" data-tooltip="DESIGN.md"     class="link-icon" @click.stop><SvgIcon name="file-text" :size="16" /></a>
        <a :href="theme.designMdUrl" :download="`${theme.id}-DESIGN.md`" data-tooltip="Download DESIGN.md" class="link-icon" @click.stop><SvgIcon name="file-down" :size="16" /></a>
      </div>
    </div>
  </a>
</template>

<style scoped>
/* ── Card container ──────────────────────────────────── */
.card {
  display: block;
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* ── Thumbnail: normal flow, full width, height follows image aspect ratio ── */
.card-thumb {
  display: block;
  width: 100%;
}

.thumb-img {
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 3;
  display: block;
}

.thumb-img.placeholder {
  opacity: 0.55;
}

/* ── Body: pinned to bottom, overlays lower half of thumbnail ── */
.card-body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: var(--space-2);
  background: var(--color-bg-2);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* ── Title row ───────────────────────────────────────── */
.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-1);
  height: 40px;
  overflow: hidden;
}

.card-title {
  font-family: var(--font-display);
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-title a {
  color: var(--color-text);
  text-decoration: none;
}
.card-title a:hover { color: var(--color-accent); }

.card-cat {
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-3);
  background: var(--color-bg-3);
  border-radius: var(--radius-pill);
  padding: 2px 8px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ── Description ─────────────────────────────────────── */
.card-desc {
  font-size: 0.875rem;
  color: var(--color-text-2);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-desc :deep(a) { color: var(--color-accent); }

/* ── Actions row ─────────────────────────────────────── */
.card-links {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-1);
  padding-top: var(--space-1);
  border-top: 1px solid var(--color-border);
}

.link-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-2);
  text-decoration: none;
  transition: color 0.12s;
  position: relative;
}
.link-icon:hover { color: var(--color-accent); }

/* Tooltip */
.link-icon[data-tooltip]::before,
.link-icon[data-tooltip]::after {
  position: absolute;
  bottom: calc(100% + var(--radius-sm));
  left: 50%;
  transform: translateX(-50%) translateY(var(--radius-sm));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s, transform 0.15s;
  white-space: nowrap;
  z-index: 10;
}
.link-icon[data-tooltip]::before {
  content: attr(data-tooltip);
  background: var(--color-text);
  color: var(--color-bg);
  font-family: var(--font-display);
  font-size: 0.6875rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 5px;
}
.link-icon[data-tooltip]::after {
  content: '';
  bottom: 100%;
  border: var(--radius-sm) solid transparent;
  border-top-color: var(--color-text);
}
.link-icon[data-tooltip]:hover::before,
.link-icon[data-tooltip]:hover::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.link-icon[data-tooltip]:last-child::before {
  left: auto;
  right: 0;
  transform: translateX(0) translateY(var(--radius-sm));
}
.link-icon[data-tooltip]:last-child::after {
  left: auto;
  right: var(--radius-sm);
  transform: translateX(0) translateY(var(--radius-sm));
}
.link-icon[data-tooltip]:last-child:hover::before,
.link-icon[data-tooltip]:last-child:hover::after {
  transform: translateX(0) translateY(0);
}

</style>
