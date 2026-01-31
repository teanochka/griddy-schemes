<template>
  <div class="w-full h-full relative">
    <svg
      class="absolute inset-0 w-full h-full"
      :style="svgStyle"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <polygon
        :points="diamondPoints"
        :fill="fillColor"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center px-4">
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

// Diamond shape: rotated square
const diamondPoints = '50,0 100,50 50,100 0,50'

const fillColor = computed(() => props.node.backgroundColor ?? '#ffffff')
const strokeColor = computed(() => props.node.borderColor ?? '#6b7280')
const strokeWidth = computed(() => {
  const width = props.node.borderWidth ?? 1
  // Scale stroke width for SVG viewBox (100x100)
  return width * 0.5
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
