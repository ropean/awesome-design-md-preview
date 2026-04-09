<script setup lang="ts">
defineProps<{ name: string; size?: number }>()
</script>

<template>
  <svg
    class="svg-icon"
    :width="size ?? 16"
    :height="size ?? 16"
    aria-hidden="true"
  ><use :href="`/icons.svg#icon-${name}`" /></svg>
</template>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
