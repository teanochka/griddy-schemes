<template>
  <div class="px-4 py-3 border-b border-gray-100">
    <h4 class="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">{{ title }}</h4>
    <div class="space-y-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
