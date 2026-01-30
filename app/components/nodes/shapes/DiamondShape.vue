<template>
  <div
    class="w-full h-full flex items-center justify-center"
    :style="shapeStyle"
  >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/types/node'

const props = defineProps<{
  node: Node
}>()

const shapeStyle = computed(() => {
  const style: Record<string, string> = {
    backgroundColor: props.node.backgroundColor || '#8b5cf6',
    transform: 'rotate(45deg)',
  }
  
  if (props.node.borderColor) {
    style.border = `2px solid ${props.node.borderColor}`
  }
  
  return style
})
</script>