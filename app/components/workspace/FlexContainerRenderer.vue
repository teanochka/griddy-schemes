<template>
  <div
    class="w-full h-full rounded-lg border overflow-hidden"
    :class="{ 'ring-2 ring-blue-400': isHovered }"
    :style="containerStyle"
  >
    <!-- Flex children area -->
    <div
      ref="flexAreaEl"
      class="w-full h-full flex"
      :style="flexContainerStyle"
    >
      <template v-for="(child, index) in children" :key="child.id">
        <!-- Drop indicator before this child -->
        <div
          v-if="isHovered && dropIndex === index"
          class="border-2 border-dashed border-blue-500 bg-blue-100/30 rounded-lg pointer-events-none shrink-0"
          :style="ghostStyle"
        />
        
        <!-- Child node -->
        <div
          class="relative cursor-grab"
          :class="{
            'ring-2 ring-blue-500 ring-offset-1': selectedNodeIds?.has(child.id),
            'shrink-0': !shouldStretch,
            'flex-1': shouldStretchMain,
            'opacity-50': draggedChildId === child.id,
            'cursor-grabbing': draggedChildId === child.id,
          }"
          :style="getChildStyle(child)"
          :draggable="true"
          @click.stop="$emit('select-child', child.id, $event)"
          @mousedown.stop
          @dragstart="onChildDragStart(child.id, index, $event)"
          @dragend="onChildDragEnd"
          @dragover.prevent="onChildDragOver(index, $event)"
          @drop.prevent="onChildDrop(index)"
        >
          <!-- Drop indicator line -->
          <div
            v-if="draggedChildId && reorderTargetIndex === index && draggedChildId !== child.id"
            class="absolute -left-1 top-0 bottom-0 w-1 bg-blue-500 rounded-full"
            :class="{ '-top-1 left-0 right-0 w-auto h-1 bottom-auto': isColumn }"
          />
          
          <component
            :is="getChildComponent(child)"
            v-if="getChildComponent(child)"
            :node="child"
            @update:content="(v) => $emit('update:content', v)"
            @update:fields="(v) => $emit('update:fields', v)"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center text-gray-400 text-sm border border-dashed rounded"
          >
            {{ child.type }}
          </div>
        </div>
      </template>
      
      <!-- Drop indicator at end -->
      <div
        v-if="isHovered && dropIndex === children.length"
        class="border-2 border-dashed border-blue-500 bg-blue-100/30 rounded-lg pointer-events-none shrink-0"
        :style="ghostStyle"
      />
      
      <!-- Empty state -->
      <div
        v-if="children.length === 0 && !isHovered"
        class="flex-1 flex items-center justify-center text-gray-400 text-sm"
      >
        Перетащите элементы сюда
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Node } from '@/types/node'
import { componentRegistry } from '@/data/componentRegistry'
import { ghostRect, dropIndex } from '@/composables/useContainerDrop'

const props = defineProps<{
  node: Node
  children: Node[]
  selectedNodeIds?: Set<number | string>
  isHovered: boolean
}>()

const emit = defineEmits<{
  'select-child': [id: number | string, event: MouseEvent]
  'update:content': [value: string]
  'update:fields': [fields: Array<{ id: string; value: string }>]
  'reorder-children': [fromIndex: number, toIndex: number]
}>()

const flexAreaEl = ref<HTMLElement | null>(null)
const draggedChildId = ref<number | string | null>(null)
const draggedChildIndex = ref<number>(-1)
const reorderTargetIndex = ref<number>(-1)

const containerStyle = computed(() => ({
  backgroundColor: props.node.backgroundColor || '#ffffff',
  borderColor: props.node.borderColor || '#d1d5db',
  borderWidth: `${props.node.borderWidth || 2}px`,
  borderStyle: 'solid',
  borderRadius: `${props.node.borderRadius || 8}px`,
}))

const flexContainerStyle = computed(() => ({
  flexDirection: props.node.flexDirection || 'column',
  gap: `${props.node.flexGap || 8}px`,
  justifyContent: props.node.justifyContent || 'flex-start',
  alignItems: props.node.alignItems || 'stretch',
  padding: `${props.node.flexPadding || 16}px`,
}))

const ghostStyle = computed(() => {
  if (!ghostRect.value) return {}
  return {
    width: `${ghostRect.value.width}px`,
    height: `${ghostRect.value.height}px`,
  }
})

// Stretch settings
const stretchMode = computed(() => props.node.flexChildStretch || 'none')
const isColumn = computed(() => (props.node.flexDirection || 'column') === 'column')

const shouldStretch = computed(() => stretchMode.value !== 'none')

// Whether to stretch in the main axis (flex-1)
const shouldStretchMain = computed(() => {
  const mode = stretchMode.value
  if (mode === 'both') return true
  if (isColumn.value) return mode === 'vertical'
  return mode === 'horizontal'
})

function getChildComponent(child: Node) {
  return componentRegistry.getType(child.type)?.component
}

function getChildStyle(child: Node) {
  const mode = stretchMode.value
  const column = isColumn.value
  
  const style: Record<string, string> = {}
  
  // Width handling
  if (mode === 'horizontal' || mode === 'both') {
    style.width = '100%'
  } else {
    style.width = `${child.width}px`
  }
  
  // Height handling
  if (mode === 'vertical' || mode === 'both') {
    style.height = column ? 'auto' : '100%'
    if (!column && mode === 'vertical') {
      style.height = '100%'
    }
  } else {
    style.height = `${child.height}px`
  }
  
  // For main axis stretching with flex-1, set min size
  if (shouldStretchMain.value) {
    if (column) {
      style.minHeight = `${child.height}px`
      style.height = 'auto'
    } else {
      style.minWidth = `${child.width}px`
      style.width = 'auto'
    }
  }
  
  return style
}

// Child reordering drag handlers
function onChildDragStart(childId: number | string, index: number, e: DragEvent) {
  draggedChildId.value = childId
  draggedChildIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(childId))
  }
}

function onChildDragEnd() {
  draggedChildId.value = null
  draggedChildIndex.value = -1
  reorderTargetIndex.value = -1
}

function onChildDragOver(index: number, e: DragEvent) {
  if (draggedChildId.value === null) return
  if (index !== draggedChildIndex.value) {
    reorderTargetIndex.value = index
  }
}

function onChildDrop(targetIndex: number) {
  if (draggedChildId.value === null) return
  const fromIndex = draggedChildIndex.value
  
  if (fromIndex !== targetIndex && fromIndex !== -1) {
    emit('reorder-children', fromIndex, targetIndex)
  }
  
  onChildDragEnd()
}

// Calculate drop index based on mouse position
function updateDropIndex(e: MouseEvent) {
  if (!flexAreaEl.value || !props.isHovered) return
  
  const rect = flexAreaEl.value.getBoundingClientRect()
  const isColumn = (props.node.flexDirection || 'column') === 'column'
  const mousePos = isColumn ? e.clientY - rect.top : e.clientX - rect.left
  const gap = props.node.flexGap || 8
  const padding = props.node.flexPadding || 16
  
  let newIndex = props.children.length
  let accumulatedPos = padding
  
  for (let i = 0; i < props.children.length; i++) {
    const child = props.children[i]
    if (!child) continue
    const childSize = isColumn ? child.height : child.width
    const midPoint = accumulatedPos + childSize / 2
    
    if (mousePos < midPoint) {
      newIndex = i
      break
    }
    
    accumulatedPos += childSize + gap
  }
  
  // Update the global dropIndex in the composable
  dropIndex.value = newIndex
}

function onMouseMove(e: MouseEvent) {
  if (props.isHovered) {
    updateDropIndex(e)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>
