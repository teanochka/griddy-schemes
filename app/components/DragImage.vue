<template>
  <div
    v-if="isDragging && dragType"
    class="fixed z-[9999] pointer-events-none"
    :style="{ left: dragPosition.x + 'px', top: dragPosition.y + 'px' }"
  >
    <div
      class="w-[120px] h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center shadow-xl opacity-90 gap-1"
      :style="{ backgroundColor: colors.bg, borderColor: colors.border }"
    >
      <span class="text-xs font-medium text-gray-700">{{ typeName || dragType }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { isDragging, dragPosition, dragType } from '@/composables/useDrag'
import { componentRegistry } from '@/data/componentRegistry'

const colors = computed(() =>
  dragType.value ? componentRegistry.getPreviewColors(dragType.value) : { bg: '#e5e7eb', border: '#9ca3af' }
)
const typeName = computed(() =>
  dragType.value ? componentRegistry.getType(dragType.value)?.name : ''
)
</script>
