<template>
  <div
    class="w-full h-full rounded-lg border overflow-hidden relative group"
    :class="{ 'ring-2 ring-blue-400': isHovered || isNativeDragHover }"
    :style="containerStyle"
  >
    <!-- Grid Lines (Background) -->
    <div 
      v-if="node.showGrid" 
      class="absolute inset-0 pointer-events-none z-0" 
      :style="gridBackgroundStyle"
    >
      <div 
        v-for="i in (node.gridRows || 3) * (node.gridCols || 3)" 
        :key="i"
        class="border border-gray-200/50"
      />
    </div>

    <!-- Grid Area -->
    <div
      ref="gridAreaEl"
      class="w-full h-full grid relative z-10"
      :style="gridContainerStyle"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop($event)"
    >
      <!-- Ghost Highlight -->
      <div
        v-if="isHovered && ghostCell"
        class="bg-blue-100/50 border-2 border-dashed border-blue-500 rounded pointer-events-none"
        :style="{
          gridColumn: `${ghostCell.col + 1} / span 1`,
          gridRow: `${ghostCell.row + 1} / span 1`
        }"
      />

      <!-- Children -->
      <template v-for="child in children" :key="child.id">
        <div
          class="relative cursor-grab"
          :class="{
            'ring-2 ring-blue-500 ring-offset-1': selectedNodeIds?.has(child.id),
            'opacity-50': draggedChildId === child.id,
            'cursor-grabbing': draggedChildId === child.id,
          }"
          :style="getChildStyle(child)"
          :draggable="true"
          @click.stop="$emit('select-child', child.id, $event)"
          @mousedown.stop
          @dragstart="onChildDragStart(child, $event)"
          @dragover.prevent
          @drop.prevent="onDrop($event, child)"
          @dragend="onChildDragEnd"
          @mouseenter="$emit('hover-start', child.id)"
          @mouseleave="$emit('hover-end', child.id)"
        >
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { Node } from '@/types/node'
import { componentRegistry } from '@/data/componentRegistry'
import { gridDropTarget } from '@/composables/useContainerDrop'

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
  'update:child-style': [id: number | string, style: Record<string, any>]
  'hover-start': [id: number | string]
  'hover-end': [id: number | string]
}>()

const gridAreaEl = ref<HTMLElement | null>(null)
const draggedChildId = ref<number | string | null>(null)
const ghostCell = ref<{ row: number; col: number } | null>(null)

const rows = computed(() => props.node.gridRows || 3)
const cols = computed(() => props.node.gridCols || 3)
const gap = computed(() => props.node.gridGap || 10)
const padding = computed(() => props.node.gridPadding || 16)

const containerStyle = computed(() => ({
  backgroundColor: props.node.backgroundColor || '#ffffff',
  borderColor: props.node.borderColor || '#d1d5db',
  borderWidth: `${props.node.borderWidth || 2}px`,
  borderStyle: 'solid',
  borderRadius: `${props.node.borderRadius || 8}px`,
}))

const gridContainerStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`,
  gridTemplateRows: `repeat(${rows.value}, minmax(0, 1fr))`,
  gap: `${gap.value}px`,
  padding: `${padding.value}px`,
}))

const gridBackgroundStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
  gridTemplateRows: `repeat(${rows.value}, 1fr)`,
  gap: `${gap.value}px`,
  padding: `${padding.value}px`,
}))

function getChildComponent(child: Node) {
  return componentRegistry.getType(child.type)?.component
}

function getChildStyle(child: Node) {
  // Read grid position from child's style prop (we'll store it there)
  const style = child.style || {}
  const row = style.gridRowStart !== undefined ? style.gridRowStart : 1
  const col = style.gridColumnStart !== undefined ? style.gridColumnStart : 1
  
  return {
    width: '100%',
    height: '100%',
    gridRow: `${row} / span 1`,
    gridColumn: `${col} / span 1`,
  }
}

// Drag handlers
function onChildDragStart(child: Node, e: DragEvent) {
  draggedChildId.value = child.id
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(child.id))
  }
}

function onChildDragEnd() {
  draggedChildId.value = null
  ghostCell.value = null
}

const isNativeDragHover = ref(false)

// Native DnD handlers
function onDragOver(e: DragEvent) {
  isNativeDragHover.value = true
  updateGhostCell(e)
}

function onDragLeave() {
  isNativeDragHover.value = false
  ghostCell.value = null
  gridDropTarget.value = null
}

function onDrop(e: DragEvent, targetNode?: Node) {
  const draggedId = e.dataTransfer?.getData('text/plain')
  if (!draggedId) return

  // Verify we have a drop target
  if (!ghostCell.value) return

  // Emitting update to parent
  const { row, col } = ghostCell.value
  
  // Check for swap
  // We can do swap logic here or let parent handle it?
  // Since we have all children here, we can check collision
  const occupant = props.children.find(c => {
     if (String(c.id) === draggedId) return false
     const cRow = c.style?.gridRowStart ?? 1
     const cCol = c.style?.gridColumnStart ?? 1
     return cRow === (row + 1) && cCol === (col + 1)
  })

  if (occupant) {
     const draggedNode = props.children.find(c => String(c.id) === draggedId)
     if (draggedNode && draggedNode.style?.gridRowStart && draggedNode.style?.gridColumnStart) {
        const oldStyle = {
           gridRowStart: draggedNode.style.gridRowStart,
           gridColumnStart: draggedNode.style.gridColumnStart
        }
        emit('update:child-style', occupant.id, oldStyle)
     }
  }

  const newStyle = {
     gridRowStart: row + 1,
     gridColumnStart: col + 1,
     position: 'relative',
     left: 'auto',
     top: 'auto'
  }
  
  emit('update:child-style', draggedId, newStyle)
  
  draggedChildId.value = null
  ghostCell.value = null
  gridDropTarget.value = null
  isNativeDragHover.value = false
}

function updateGhostCell(e: MouseEvent) {
  if (!gridAreaEl.value || (!props.isHovered && !isNativeDragHover.value)) {
    ghostCell.value = null
    gridDropTarget.value = null
    return
  }

  const rect = gridAreaEl.value.getBoundingClientRect()
  // Account for padding
  const innerX = e.clientX - rect.left - padding.value
  const innerY = e.clientY - rect.top - padding.value
  
  const width = rect.width - (padding.value * 2)
  const height = rect.height - (padding.value * 2)
  
  if (innerX < 0 || innerX > width || innerY < 0 || innerY > height) {
    ghostCell.value = null
    gridDropTarget.value = null
    return
  }

  // Calculate cell dimensions including gap
  // Total width = (cols * cellW) + ((cols - 1) * gap)
  // cellW = (Total width - ((cols - 1) * gap)) / cols
  const totalGapW = (cols.value - 1) * gap.value
  const cellW = (width - totalGapW) / cols.value
  
  const totalGapH = (rows.value - 1) * gap.value
  const cellH = (height - totalGapH) / rows.value

  // Simple approx: divide mouse pos by (cell + gap)
  // But gap is only between cells.
  // Let's use simplified math: percent of width * cols
  
  let col = Math.floor(innerX / (width / cols.value))
  let row = Math.floor(innerY / (height / rows.value))

  // Clamp
  col = Math.max(0, Math.min(col, cols.value - 1))
  row = Math.max(0, Math.min(row, rows.value - 1))

  const cell = { row, col }
  ghostCell.value = cell
  gridDropTarget.value = cell
}

function onMouseMove(e: MouseEvent) {
  if (props.isHovered) {
    updateGhostCell(e)
  }
}

// Expose ability to get current drop target
defineExpose({
  getDropTarget: () => ghostCell.value
})

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
})
</script>
