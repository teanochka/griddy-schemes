<template>
  <div
    class="w-full h-full rounded-lg border-2 border-dashed border-gray-400 bg-gray-50/80 grid place-items-center"
  >
    <div class="grid grid-cols-3 gap-1 w-2/3 h-2/3 opacity-30">
      <div v-for="i in 9" :key="i" class="bg-gray-400 rounded-sm"></div>
    </div>
    <span class="text-xs text-gray-500 absolute bottom-2">Сетка</span>
  </div>
</template>

<script setup lang="ts">
import type { Node } from '@/types/node'

defineProps<{
  node: Node
}>()
</script>
