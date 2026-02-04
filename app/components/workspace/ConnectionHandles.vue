<template>
  <div
    class="absolute pointer-events-none"
    :style="{
      left: `${node.x}px`,
      top: `${node.y}px`,
      width: `${node.width}px`,
      height: `${node.height}px`,
    }"
  >
    <!-- Top Handle -->
    <div
      class="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full shadow-sm cursor-crosshair pointer-events-auto hover:bg-blue-100 transition-colors z-20"
      @mousedown.stop="$emit('connect-start', 'top', $event)"
      @mouseup.stop="$emit('connect-end', 'top')"
    />
    <!-- Right Handle -->
    <div
      class="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full shadow-sm cursor-crosshair pointer-events-auto hover:bg-blue-100 transition-colors z-20"
      @mousedown.stop="$emit('connect-start', 'right', $event)"
      @mouseup.stop="$emit('connect-end', 'right')"
    />
    <!-- Bottom Handle -->
    <div
      class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full shadow-sm cursor-crosshair pointer-events-auto hover:bg-blue-100 transition-colors z-20"
      @mousedown.stop="$emit('connect-start', 'bottom', $event)"
      @mouseup.stop="$emit('connect-end', 'bottom')"
    />
    <!-- Left Handle -->
    <div
      class="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-white border border-blue-500 rounded-full shadow-sm cursor-crosshair pointer-events-auto hover:bg-blue-100 transition-colors z-20"
      @mousedown.stop="$emit('connect-start', 'left', $event)"
      @mouseup.stop="$emit('connect-end', 'left')"
    />
  </div>
</template>

<script setup lang="ts">
import type { Node } from '@/types/node'
import type { HandlePosition } from '@/types/connection'

defineProps<{
  node: Node
}>()

defineEmits<{
  'connect-start': [handle: HandlePosition, event: MouseEvent]
  'connect-end': [handle: HandlePosition]
}>()
</script>
