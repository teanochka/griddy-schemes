<template>
  <div class="w-full h-full relative">
    <!-- SVG for note shape with folded corner -->
    <svg
      class="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <!-- Main note rectangle with clipped corner -->
      <path
        :d="notePath"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
      />
      
      <!-- Folded corner triangle -->
      <path
        d="M 85,0 L 100,15 L 85,15 Z"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
      />
      
      <!-- Diagonal fold line -->
      <line
        x1="85"
        y1="0"
        x2="100"
        y2="15"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
      />
    </svg>
    
    <!-- Text input overlay -->
    <div class="absolute inset-0 p-3 flex items-start justify-start">
      <textarea
        ref="contentInput"
        class="text-gray-700 w-full h-full min-w-0 bg-transparent border-none outline-none focus:ring-0 resize-none"
        :class="textAlignClass"
        :style="textStyle"
        :value="node.content"
        @input="onInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Node } from '@/types/node'

const props = defineProps<{
  node: Node
}>()

const emit = defineEmits<{
  'update:content': [value: string]
}>()

const contentInput = ref<HTMLTextAreaElement | null>(null)

// Path for the main note body (rectangle with top-right corner cut)
const notePath = 'M 0,0 L 85,0 L 85,15 L 100,15 L 100,100 L 0,100 Z'

const fillColor = computed(() => props.node.backgroundColor ?? '#fffacd')
const strokeColor = computed(() => props.node.borderColor ?? '#6b7280')

const strokeWidth = computed(() => {
  const width = props.node.borderWidth ?? 1
  // Scale stroke width for SVG viewBox (100x100)
  return width * 0.8
})

const textAlignClass = computed(() => {
  const a = props.node.textAlign ?? 'left'
  return a === 'left' ? 'text-left' : a === 'right' ? 'text-right' : 'text-center'
})

const textStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.node.fontSize) s.fontSize = `${props.node.fontSize}px`
  else s.fontSize = '14px'
  if (props.node.textColor) s.color = props.node.textColor
  if (props.node.fontWeight) s.fontWeight = String(props.node.fontWeight)
  return s
})

function onInput(e: Event) {
  const t = (e.target as HTMLTextAreaElement).value
  emit('update:content', t)
}
</script>
