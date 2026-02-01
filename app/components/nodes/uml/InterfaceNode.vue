<template>
  <div
    class="w-full h-full flex flex-col border border-gray-300"
    :style="blockStyle"
  > 
    <!-- Interface Name Section -->
    <div class="flex-none p-2 border-b border-t" :style="{ borderColor: borderColorValue }">
      <input
        ref="contentInput"
        type="text"
        class="text-gray-700 w-full min-w-0 bg-transparent border-none outline-none focus:ring-0 text-center font-semibold"
        :class="textAlignClass"
        :style="textStyle"
        :value="node.content"
        @input="onInput"
      />
    </div>
    
    <!-- Methods Section -->
    <div class="flex-1 p-2 text-sm">
      <div class="text-gray-600">+ method(): Type</div>
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

const borderColorValue = computed(() => props.node.borderColor ?? '#6b7280')

const blockStyle = computed(() => {
  const s: Record<string, string> = {}
  
  // Background
  if (props.node.backgroundColor) {
    s.backgroundColor = props.node.backgroundColor
  } else {
    s.backgroundColor = '#ffffff'
  }
  
  // Border
  if (props.node.borderColor) {
    s.borderColor = props.node.borderColor
  } else {
    s.borderColor = '#6b7280'
  }
  if (props.node.borderWidth !== undefined) {
    s.borderWidth = `${props.node.borderWidth}px`
  } else {
    s.borderWidth = '1px'
  }
  
  // Border radius
  if (props.node.borderRadius !== undefined) {
    if (typeof props.node.borderRadius === 'string') {
      s.borderRadius = props.node.borderRadius
    } else {
      s.borderRadius = `${props.node.borderRadius}px`
    }
  } else {
    s.borderRadius = '0px'
  }
  
  // Shadow
  if (props.node.shadowColor || props.node.shadowBlur) {
    const color = props.node.shadowColor ?? '#00000040'
    const blur = props.node.shadowBlur ?? 10
    const offsetX = props.node.shadowOffsetX ?? 0
    const offsetY = props.node.shadowOffsetY ?? 5
    s.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`
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
