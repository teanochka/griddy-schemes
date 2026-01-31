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
        points="30,10 70,10 90,90 10,90"
        :fill="node.backgroundColor || '#ef4444'"
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
</script>