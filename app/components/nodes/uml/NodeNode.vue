<template>
  <div class="w-full h-full relative">
    <!-- SVG for 3D cube shape -->
    <svg
      class="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      :style="svgStyle"
    >
      <!-- Define the 3D cube faces -->
      <!-- Front face (main rectangle) -->
      <rect
        x="0"
        y="15"
        width="75"
        height="85"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
      />
      
      <!-- Right side face (parallelogram) -->
      <polygon
        points="75,15 100,0 100,85 75,100"
        :fill="sideFillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
      />
      
      <!-- Top face (parallelogram) -->
      <polygon
        points="0,15 25,0 100,0 75,15"
        :fill="topFillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
      />
    </svg>
    
    <!-- Text input overlay -->
    <div class="absolute inset-0 flex items-center justify-center pr-6 pb-4">
      <input
        ref="contentInput"
        type="text"
        class="text-gray-700 w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 text-center"
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

const contentInput = ref<HTMLInputElement | null>(null)

const fillColor = computed(() => props.node.backgroundColor ?? '#ffffff')
const strokeColor = computed(() => props.node.borderColor ?? '#6b7280')

// Lighter shades for side and top faces to create 3D effect
const sideFillColor = computed(() => {
  if (props.node.backgroundColor && props.node.backgroundColor !== '#ffffff') {
    return props.node.backgroundColor
  }
  return '#e5e7eb' // Slightly darker for side
})

const topFillColor = computed(() => {
  if (props.node.backgroundColor && props.node.backgroundColor !== '#ffffff') {
    return props.node.backgroundColor
  }
  return '#f3f4f6' // Lighter for top
})

const strokeWidth = computed(() => {
  const width = props.node.borderWidth ?? 1
  // Scale stroke width for SVG viewBox (100x100)
  return width * 0.8
})

const svgStyle = computed(() => {
  const s: Record<string, string> = {}
  
  // Shadow
  if (props.node.shadowColor || props.node.shadowBlur) {
    const color = props.node.shadowColor ?? '#00000040'
    const blur = props.node.shadowBlur ?? 10
    const offsetX = props.node.shadowOffsetX ?? 0
    const offsetY = props.node.shadowOffsetY ?? 5
    s.filter = `drop-shadow(${offsetX}px ${offsetY}px ${blur}px ${color})`
  }
  
  return s
})

const textAlignClass = computed(() => {
  const a = props.node.textAlign ?? 'center'
  return a === 'left' ? 'text-left' : a === 'right' ? 'text-right' : 'text-center'
})

const textStyle = computed(() => {
  const s: Record<string, string> = {}
  if (props.node.fontSize) s.fontSize = `${props.node.fontSize}px`
  if (props.node.textColor) s.color = props.node.textColor
  if (props.node.fontWeight) s.fontWeight = String(props.node.fontWeight)
  return s
})

function onInput(e: Event) {
  const t = (e.target as HTMLInputElement).value
  emit('update:content', t)
}
</script>
