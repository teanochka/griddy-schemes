<template>
  <div
    class="w-full h-full flex items-center justify-center relative overflow-hidden"
  >
    <div
      class="w-full h-full"
      :style="trapezoidStyle"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type { Node } from '@/types/node'

const props = defineProps<{
  node: Node
}>()

const trapezoidStyle = computed(() => {
  const topWidth = props.node.width * 0.6
  const bottomWidth = props.node.width
  
   const s: Record<string, string> = {
    position: 'absolute',
    top: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '0',
    height: '0',
    borderLeft: `${topWidth / 2}px solid transparent`,
    borderRight: `${topWidth / 2}px solid transparent`,
    borderTop: `${props.node.height}px solid ${props.node.backgroundColor || '#ef4444'}`,
    borderBottom: 'none',
  }
  return s
})
</script>