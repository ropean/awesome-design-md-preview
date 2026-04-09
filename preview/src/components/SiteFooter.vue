<script setup lang="ts">
import { REPO_ORIGINAL, REPO_PREVIEW } from '../constants'
</script>

<template>
  <footer class="site-footer">
    <img src="/favicon.svg" alt="" class="footer-icon" width="16" height="16" aria-hidden="true" />
    <a :href="REPO_PREVIEW" target="_blank" rel="noopener">awesome-design-md-preview</a>
    <span class="sep">·</span>
    <span class="footer-built">Built on <a :href="REPO_ORIGINAL" target="_blank" rel="noopener">awesome-design-md</a></span>
  </footer>
</template>

<style scoped>
.site-footer {
  padding: 18px 32px;
  border-top: 1px solid var(--color-border);
  font-family: var(--font-display);
  font-size: 0.8125rem;
  color: var(--color-text-3);
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}

.footer-icon { display: block; flex-shrink: 0; }
.site-footer a { color: var(--color-text-2); text-decoration: none; }
.site-footer a:hover { color: var(--color-accent); }
.sep { color: var(--color-text-3); }
.footer-built { color: var(--color-text-3); }

@media (max-width: 768px) {
  .site-footer { padding: 14px 16px; }
}
</style>
