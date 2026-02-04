<template>
  <div
    ref="el"
    class="absolute cursor-move select-none transition-shadow duration-200
           shadow-sm hover:shadow-md
           opacity-100 min-w-[50px] min-h-[50px]"
    :class="{
      'opacity-80 shadow-2xl z-50 cursor-grabbing': isDragging,
      'ring-2 ring-blue-500 ring-offset-2': selected && !isDragging,
      'z-10': !isContainerNode,
      'z-5': isContainerNode,
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
      <!-- Container node: use dedicated renderer -->
      <template v-if="isContainerNode">
        <FlexContainerRenderer
          ref="containerRenderer"
          :node="node"
          :children="childNodes"
          :selected-node-ids="selectedNodeIds"
          :is-hovered="isHoveredContainer"
          @select-child="onSelectChild"
          @reorder-children="onReorderChildren"
          @update:content="(v) => $emit('update:content', v)"
          @update:fields="(v) => $emit('update:fields', v)"
        />
      </template>
      
      <!-- Non-container node: render component -->
      <template v-else>
        <component
          :is="component"
          v-if="component"
          ref="nodeComponent"
          :node="node"
          @update:content="(v) => $emit('update:content', v)"
          @update:fields="(v) => $emit('update:fields', v)"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center text-gray-400 text-sm border border-dashed rounded-lg"
        >
          {{ node.type }}
        </div>
      </template>
      
      <!-- Resize handle -->
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
import { isContainer, getChildren } from '@/types/node'
import { componentRegistry } from '@/data/componentRegistry'
import { hoveredContainerId, updateContainerHover, clearContainerHover, dropIndex } from '@/composables/useContainerDrop'
import FlexContainerRenderer from './FlexContainerRenderer.vue'

const props = defineProps<{
  node: Node
  allNodes?: Node[]
  workspaceRef: { value: HTMLElement | null } | null
  selected?: boolean
  selectedNodeIds?: Set<number | string>
}>()

const emit = defineEmits<{
  'update:position': [id: number | string, x: number, y: number]
  'update:size': [id: number | string, w: number, h: number]
  'update:content': [value: string]
  'update:fields': [fields: Array<{ id: string; value: string }>]
  'update:parent': [id: number | string, parentId: number | string | null, insertIndex: number]
  'select': [event?: MouseEvent]
  'select-child': [childId: number | string, event: MouseEvent]
  'reorder-children': [containerId: number | string, fromIndex: number, toIndex: number]
  'delete': []
}>()

const el = ref<HTMLElement | null>()
const nodeComponent = ref<any>(null)
const containerRenderer = ref<InstanceType<typeof FlexContainerRenderer> | null>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const component = computed(() => componentRegistry.getType(props.node.type)?.component)
const isContainerNode = computed(() => isContainer(props.node))
const isHoveredContainer = computed(() => hoveredContainerId.value === props.node.id)

const childNodes = computed(() => {
  if (!props.allNodes || !isContainerNode.value) return []
  return getChildren(props.allNodes, props.node.id)
})

function onSelectChild(id: number | string, event: MouseEvent) {
  // Emit the child selection event so workspace can select the child node
  emit('select-child', id, event)
}

function onReorderChildren(fromIndex: number, toIndex: number) {
  // Emit the reorder event with container ID
  emit('reorder-children', props.node.id, fromIndex, toIndex)
}

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
  const x = Math.round(e.clientX - dragOffset.value.x)
  const y = Math.round(e.clientY - dragOffset.value.y)
  emit('update:position', props.node.id, x, y)
  
  // Detect container hover during drag (only for non-container nodes)
  if (!isContainerNode.value && props.allNodes) {
    const containers = props.allNodes.filter(n => isContainer(n) && n.parentId == null && n.id !== props.node.id)
    // Use the center of the dragged node position (x, y are canvas coordinates)
    const nodeCenterX = x + props.node.width / 2
    const nodeCenterY = y + props.node.height / 2
    updateContainerHover(
      nodeCenterX,
      nodeCenterY,
      containers,
      { width: props.node.width, height: props.node.height },
      props.node.id
    )
  }
}

function onDragUp(e: MouseEvent) {
  isDragging.value = false
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragUp)
  
  // Check if we should parent to a container
  if (hoveredContainerId.value && !isContainerNode.value) {
    const container = props.allNodes?.find(n => n.id === hoveredContainerId.value)
    if (container) {
      // Get the drop index from the FlexContainerRenderer
      const insertIdx = dropIndex.value
      emit('update:parent', props.node.id, container.id, insertIdx)
    }
  }
  
  clearContainerHover()
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

function handleDoubleClick(e: MouseEvent) {
  emit('select', e)
  
  const target = e.target as HTMLElement
  const clickedInput = target.closest('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null
  
  if (clickedInput) {
    clickedInput.focus()
    clickedInput.select()
  } else {
    const input = el.value?.querySelector('input')
    const textarea = el.value?.querySelector('textarea')
    
    if (input) {
      input.focus()
      input.select()
    } else if (textarea) {
      textarea.focus()
      textarea.select()
    } else if (nodeComponent.value) {
      const firstField = nodeComponent.value.classNameInput || 
                         nodeComponent.value.attributesInput || 
                         nodeComponent.value.methodsInput
      if (firstField) {
        firstField.focus()
        firstField.select()
      }
    }
  }
}
</script>
