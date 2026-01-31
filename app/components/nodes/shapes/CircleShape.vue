<template>
  <div class="w-full h-full flex items-center justify-center relative">
    <svg
      class="w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      :style="svgStyle"
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
      <circle
        cx="50"
        cy="50"
        :r="circleRadius"
        :fill="node.backgroundColor || '#3b82f6'"
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

// Adjust radius based on border width to keep circle inside viewbox
const strokeWidth = computed(() => {
  if (!props.node.borderColor && !props.node.borderWidth) return 0
  return props.node.borderWidth ?? 2
})

const circleRadius = computed(() => {
  // Reduce radius to accommodate stroke (stroke is centered on path)
  const adjustment = strokeWidth.value / 2
  return 45 - adjustment
})

const svgStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.node.borderRadius) {
    style.borderRadius = `${props.node.borderRadius}px`
  }
  return style
})
</script>