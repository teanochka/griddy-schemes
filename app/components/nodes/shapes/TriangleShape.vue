<template>
  <div
    class="w-full h-full flex items-center justify-center relative overflow-hidden"
  >
    <div
      class="w-full h-full"
      :style="triangleStyle"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/types/node'

const props = defineProps<{
  node: Node
}>()

const emit = defineEmits<{
  'update:content': [value: string]
}>()

const triangleStyle = computed(() => {
  const s: Record<string, string> = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    borderLeft: `${props.node.width / 2}px solid transparent`,
    borderRight: `${props.node.width / 2}px solid transparent`,
    borderBottom: `${props.node.height}px solid ${props.node.backgroundColor || '#f59e0b'}`,
  }
  return s
})
</script>