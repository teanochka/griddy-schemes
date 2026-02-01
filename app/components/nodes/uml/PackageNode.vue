<template>
  <div class="w-full h-full relative">
    <!-- Package tab -->
    <div 
      class="absolute left-0 top-0 w-[30%] h-[20%] border border-b-0"
      :style="{ 
        borderColor: borderColorValue,
        backgroundColor: bgColorValue,
      }"
    >
      <div class="text-xs text-center text-gray-600 leading-6"></div>
    </div>
    
    <!-- Main package body -->
    <div
      class="absolute w-full top-[20%] h-[80%] pt-6 p-3 flex items-start justify-center border border-gray-300"
      :style="blockStyle"
    >
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

const borderColorValue = computed(() => props.node.borderColor ?? '#6b7280')
const bgColorValue = computed(() => props.node.backgroundColor ?? '#ffffff')

const blockStyle = computed(() => {
  const s: Record<string, string> = {}
  
  // Background
  s.backgroundColor = bgColorValue.value
  
  // Border
  s.borderColor = borderColorValue.value
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
