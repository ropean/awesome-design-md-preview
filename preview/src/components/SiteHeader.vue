<script setup lang="ts">
import { SITE_TITLE, REPO_PREVIEW } from '../constants'
import DarkModeToggle from './DarkModeToggle.vue'
import SvgIcon from './SvgIcon.vue'
</script>

<template>
  <header class="site-header">
    <a href="/" class="site-logo">
      <img src="/favicon.svg" alt="" class="logo-icon" width="32" height="32" aria-hidden="true" />
      {{ SITE_TITLE }}
    </a>
    <nav class="header-links">
      <a :href="REPO_PREVIEW" target="_blank" rel="noopener" class="header-link"><SvgIcon name="github" :size="15" /> <span>GitHub</span></a>
      <DarkModeToggle />
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 32px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: 100;
  gap: var(--space-2);
}

.site-logo {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--color-text);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.site-logo:hover { color: var(--color-accent); }
.logo-icon { display: block; flex-shrink: 0; }

.header-links {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header-link {
  font-family: var(--font-display);
  font-size: 0.8125rem;
  color: var(--color-text-2);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.header-link:hover { color: var(--color-accent); }

@media (max-width: 640px) {
  .site-header { padding: 12px 16px; }
  .header-link span { display: none; }
}
</style>
