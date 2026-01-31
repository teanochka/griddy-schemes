<template>
  <div class="w-full h-full flex items-center justify-center relative">
    <svg
      class="w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs v-if="hasShadow">
        <filter :id="`shadow-${node.id}`">
          <feDropShadow
            :dx="node.shadowOffsetX ?? 0"
            :dy="node.shadowOffsetY ?? 5"
            :stdDeviation="(node.shadowBlur ?? 10) / 2"
            :flood-color="node.shadowColor ?? '#00000040'"
          />
        </filter>
      </defs>
      <polygon
        :points="starPoints"
        :fill="node.backgroundColor || '#fbbf24'"
        :stroke="node.borderColor"
        :stroke-width="strokeWidth"
        :filter="hasShadow ? `url(#shadow-${node.id})` : undefined"
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

const hasShadow = computed(() => {
  return !!(props.node.shadowColor || props.node.shadowBlur)
})

const strokeWidth = computed(() => {
  if (!props.node.borderColor && !props.node.borderWidth) return 0
  return props.node.borderWidth ?? 2
})

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