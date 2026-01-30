<template>
  <div
    class="w-full h-full flex items-center justify-center relative"
  >
    <svg
      class="w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polygon
        :points="starPoints"
        :fill="node.backgroundColor || '#fbbf24'"
        stroke-width="2"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/types/node'

const props = defineProps<{
  node: Node
}>()

const starPoints = computed(() => {
  const points = []
  const numPoints = 5
  const innerRadius = 30
  const outerRadius = 50
  
  for (let i = 0; i < numPoints * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (Math.PI / numPoints) * i - Math.PI / 2
    const x = 50 + radius * Math.cos(angle)
    const y = 50 + radius * Math.sin(angle)
    points.push(`${x},${y}`)
  }
  
  return points.join(' ')
})
</script>