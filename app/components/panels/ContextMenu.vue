<template>
  <div
    v-if="node"
    class="absolute z-20 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border border-gray-200 bg-white"
    :style="{ left: `${node.x}px`, top: `${node.y - 44}px` }"
    @mousedown.stop
  >
    <span class="text-xs font-medium text-gray-500 mr-1">Заливка</span>
    <input
      type="color"
      :value="node.backgroundColor ?? '#ffffff'"
      class="w-8 h-7 rounded border border-gray-300 cursor-pointer"
      @input="onColorInput"
    />
    <span class="text-xs text-gray-400">|</span>
    <span class="text-xs font-medium text-gray-500">Ширина</span>
    <input
      type="number"
      :value="node.width"
      min="50"
      max="800"
      class="w-16 px-2 py-1 text-sm rounded border border-gray-300"
      @input="onWidthInput"
    />
    <span class="text-xs font-medium text-gray-500">Высота</span>
    <input
      type="number"
      :value="node.height"
      min="50"
      max="600"
      class="w-16 px-2 py-1 text-sm rounded border border-gray-300"
      @input="onHeightInput"
    />
    <span class="text-xs text-gray-400">|</span>
    <span class="text-xs font-medium text-gray-500">Текст</span>
    <div class="flex gap-0.5">
      <button
        type="button"
        class="p-1.5 rounded hover:bg-gray-100"
        :class="{ 'bg-gray-200': (node.textAlign ?? 'center') === 'left' }"
        title="По левому краю"
        @mousedown.prevent="setAlign('left')"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h10M4 18h16" />
        </svg>
      </button>
      <button
        type="button"
        class="p-1.5 rounded hover:bg-gray-100"
        :class="{ 'bg-gray-200': (node.textAlign ?? 'center') === 'center' }"
        title="По центру"
        @mousedown.prevent="setAlign('center')"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h12M4 18h16" />
        </svg>
      </button>
      <button
        type="button"
        class="p-1.5 rounded hover:bg-gray-100"
        :class="{ 'bg-gray-200': (node.textAlign ?? 'center') === 'right' }"
        title="По правому краю"
        @mousedown.prevent="setAlign('right')"
      >
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Node } from '@/types/node'

const props = defineProps<{
  node: Node | null
}>()

const emit = defineEmits<{
  'update:node': []
}>()

function onColorInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  if (props.node) {
    props.node.backgroundColor = v
    emit('update:node')
  }
}

function onWidthInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (props.node && !Number.isNaN(v) && v >= 50) {
    props.node.width = Math.min(800, v)
    emit('update:node')
  }
}

function onHeightInput(e: Event) {
  const v = Number((e.target as HTMLInputElement).value)
  if (props.node && !Number.isNaN(v) && v >= 50) {
    props.node.height = Math.min(600, v)
    emit('update:node')
  }
}

function setAlign(a: 'left' | 'center' | 'right') {
  if (props.node) {
    props.node.textAlign = a
    emit('update:node')
  }
}
</script>
