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
      <rect
        :x="strokeOffset"
        :y="strokeOffset"
        :width="rectWidth"
        :height="rectHeight"
        :rx="borderRadiusViewBox"
        :ry="borderRadiusViewBox"
        :fill="node.backgroundColor || '#10b981'"
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

// Offset to keep stroke inside viewbox
const strokeOffset = computed(() => strokeWidth.value / 2)

// Adjust rect size to accommodate stroke
const rectWidth = computed(() => 100 - strokeWidth.value)
const rectHeight = computed(() => 100 - strokeWidth.value)

// Convert border radius from pixels to viewBox units
// Assuming average dimension of ~100px for scaling
const borderRadiusViewBox = computed(() => {
  if (!props.node.borderRadius) return 4 // Small default radius
  // Scale based on viewBox (100x100)
  return (props.node.borderRadius / 100) * 100
})

const svgStyle = computed(() => {
  const style: Record<string, string> = {}
  return style
})
</script>