<script setup lang="ts">
import { useDarkMode } from './composables/useDarkMode'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import HomePage from './pages/HomePage.vue'

useDarkMode()
</script>

<template>
  <div class="layout">
    <SiteHeader />
    <main class="layout-main">
      <HomePage />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-main {
  flex: 1;
}
</style>
