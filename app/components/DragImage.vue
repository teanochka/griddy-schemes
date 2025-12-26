<template>
  <div
    v-if="isDragging"
    class="fixed z-[9999] pointer-events-none"
    :style="{
      left: dragPosition.x + 'px',
      top: dragPosition.y + 'px'
    }"
  >
    <div
      class="w-[120px] h-[120px] border-2 border-dashed rounded-lg
             flex items-center justify-center shadow-xl opacity-90"
      :style="{ backgroundColor, borderColor }"
    >
      {{ type }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { isDragging, dragPosition, dragType } from '@/composables/useDrag'

const type = dragType

const backgroundColor = computed(() => ({
  'basic-card': '#fef3c7',
  'text-block': '#dbeafe',
  'image-block': '#dcfce7',
  'flex-container': '#f3e8ff',
  'grid-container': '#fce7f3',
}[type.value] || '#eee'))

const borderColor = computed(() => ({
  'basic-card': '#f59e0b',
  'text-block': '#3b82f6',
  'image-block': '#10b981',
  'flex-container': '#8b5cf6',
  'grid-container': '#ec4899',
}[type.value] || '#999'))
</script>
