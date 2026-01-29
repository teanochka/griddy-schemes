<template>
  <div
    class="w-full h-full rounded-lg border-2 border-dashed border-gray-400 bg-gray-50/80 flex flex-col"
  >
    <span class="text-xs text-gray-500 p-2 self-center">Контейнер</span>
  </div>
</template>

<script setup lang="ts">
import type { Node } from '@/types/node'

defineProps<{
  node: Node
}>()
</script>
