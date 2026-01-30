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
    backgroundColor: props.node.backgroundColor || '#10b981',
  }
  
  if (props.node.borderColor) {
    style.border = `2px solid ${props.node.borderColor}`
  }
  
  if (props.node.borderRadius) {
    style.borderRadius = `${props.node.borderRadius}px`
  } else if (props.node.shape === 'square') {
    style.borderRadius = '4px'
  }
  
  return style
})
</script>