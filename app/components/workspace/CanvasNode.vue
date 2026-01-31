<template>
  <div
    ref="el"
    class="absolute cursor-move select-none transition-shadow duration-200
           shadow-sm hover:shadow-md overflow-hidden
           opacity-100 z-10 min-w-[50px] min-h-[50px]"
    :class="{
      'opacity-80 shadow-2xl z-50 cursor-grabbing': isDragging,
      'ring-2 ring-blue-500 ring-offset-2': selected && !isDragging,
    }"
    :style="{
      left: `${node.x}px`,
      top: `${node.y}px`,
      width: `${node.width}px`,
      height: `${node.height}px`,
      opacity: node.opacity !== undefined ? node.opacity / 100 : 1,
      ...(typeof node.style === 'object' && node.style ? node.style : {}),
    }"
    @mousedown.stop.prevent="onMouseDown"
    @dblclick.stop="handleDoubleClick"
  >
    <div class="w-full h-full relative">
      <component
        :is="component"
        v-if="component"
        :node="node"
        @update:content="(v) => $emit('update:content', v)"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg"
      >
        {{ node.type }}
      </div>
      <div
        class="absolute -bottom-1.5 -right-1.5 w-5 h-5 cursor-se-resize bg-slate-700 rounded-sm opacity-70 hover:opacity-100"
        aria-label="Resize"
        @mousedown.stop="startResize"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Node } from '@/types/node'
import { componentRegistry } from '@/data/componentRegistry'

const props = defineProps<{
  node: Node
  workspaceRef: { value: HTMLElement | null } | null
  selected?: boolean
}>()

const emit = defineEmits<{
  'update:position': [id: number | string, x: number, y: number]
  'update:size': [id: number | string, w: number, h: number]
  'update:content': [value: string]
  select: [event?: MouseEvent]
  delete: []
}>()

const el = ref<HTMLElement | null>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const component = computed(() => componentRegistry.getType(props.node.type)?.component)

function onMouseDown(e: MouseEvent) {
  emit('select', e)
  const target = e.target as HTMLElement
  if (target.closest('input, textarea, [contenteditable="true"]')) {
    return
  }
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - props.node.x,
    y: e.clientY - props.node.y,
  }
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragUp)
}

function onDragMove(e: MouseEvent) {
  const x = Math.round(e.clientX  - dragOffset.value.x)
  const y = Math.round(e.clientY - dragOffset.value.y)
  emit('update:position', props.node.id, x, y)
}

function onDragUp() {
  isDragging.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragUp)
}

function startResize(e: MouseEvent) {
  emit('select', e)
  isResizing.value = true
  e.stopPropagation()
  const startX = e.clientX
  const startY = e.clientY
  let startW = props.node.width
  let startH = props.node.height

  function onResizeMove(ev: MouseEvent) {
    const dw = ev.clientX - startX
    const dh = ev.clientY - startY
    const w = Math.max(50, startW + dw)
    const h = Math.max(50, startH + dh)
    emit('update:size', props.node.id, w, h)
  }

  function onResizeUp() {
    isResizing.value = false
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', onResizeUp)
  }

  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeUp)
}

function handleDoubleClick(e:MouseEvent) {
  emit('select', e)
  const input = el.value?.querySelector('input')
  if (input) {
    input.focus()
    input.select()
  }
}

</script>
