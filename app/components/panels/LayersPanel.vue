<template>
  <div class="w-64 bg-slate-50 border-l border-gray-300 h-full flex flex-col overflow-hidden">
    <div class="font-black text-slate-800 text-xl py-4 px-4 shrink-0">Слои</div>

    <div class="flex-1 overflow-y-auto px-4 pb-4">
      <div v-if="reversedNodes.length === 0" class="text-sm text-gray-500 text-center py-8">
        Нет слоёв
      </div>

      <div v-else class="space-y-1">
        <div
          v-for="(node, index) in reversedNodes"
          :key="node.id"
          :draggable="true"
          class="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors group"
          :class="{
            'bg-blue-100 border border-blue-400': node.id === selectedNodeId,
            'hover:bg-slate-200/80 border border-transparent': node.id !== selectedNodeId,
          }"
          @click="handleSelect(node.id)"
          @dragstart="handleDragStart($event, index)"
          @dragover.prevent="handleDragOver($event, index)"
          @drop="handleDrop($event, index)"
          @dragenter.prevent="handleDragEnter(index)"
          @dragleave="handleDragLeave"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <!-- Icon representing the node type -->
            <div
              class="w-8 h-8 shrink-0 rounded border flex items-center justify-center text-xs font-medium shadow-sm"
              :style="{ backgroundColor: getNodeColor(node), borderColor: '#9ca3af' }"
            >
              {{ getNodeLabel(node) }}
            </div>

            <!-- Node name (with preparation for future renaming) -->
            <span class="text-sm text-gray-800 truncate" :title="getNodeName(node)">
              {{ getNodeName(node) }}
            </span>
          </div>

          <!-- Visual indicator for drag target -->
          <div
            v-if="dragOverIndex === index"
            class="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Node } from '@/types/node'

const props = defineProps<{
  nodes: Node[]
  selectedNodeId: number | string | null
}>()

const emit = defineEmits<{
  select: [id: number | string]
  reorder: [newOrder: Node[]]
}>()

// Reverse the nodes array so the last node (highest z-index) appears at the top
const reversedNodes = computed(() => [...props.nodes].reverse())

const draggedIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function handleSelect(id: number | string) {
  emit('select', id)
}

function handleDragStart(e: DragEvent, index: number) {
  draggedIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}

function handleDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function handleDragEnter(index: number) {
  dragOverIndex.value = index
}

function handleDragLeave() {
  // Only clear if we're leaving the entire list
  // This prevents flickering when moving between items
}

function handleDrop(e: DragEvent, dropIndex: number) {
  e.preventDefault()
  
  if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
    draggedIndex.value = null
    dragOverIndex.value = null
    return
  }

  // Since we're working with a reversed array, we need to convert back
  const originalNodes = [...props.nodes]
  const reversedLength = reversedNodes.value.length

  // Convert reversed indices to original indices
  const fromOriginalIndex = reversedLength - 1 - draggedIndex.value
  const toOriginalIndex = reversedLength - 1 - dropIndex

  // Remove the dragged node and insert it at the new position
  const [movedNode] = originalNodes.splice(fromOriginalIndex, 1)
  originalNodes.splice(toOriginalIndex, 0, movedNode)

  // Emit the new order
  emit('reorder', originalNodes)

  draggedIndex.value = null
  dragOverIndex.value = null
}

// Helper functions for node display
function getNodeLabel(node: Node): string {
  // Use the first 2 characters of the type or content
  if (node.content && typeof node.content === 'string') {
    return node.content.slice(0, 2).toUpperCase() || node.type.slice(0, 2).toUpperCase()
  }
  return node.type.slice(0, 2).toUpperCase()
}

function getNodeName(node: Node): string {
  // Prepare for future renaming feature - for now use content or type
  // In future, we can add a 'name' field to the Node interface
  if (node.content && typeof node.content === 'string' && node.content.trim()) {
    return node.content.length > 20 ? node.content.slice(0, 20) + '...' : node.content
  }
  return `${node.type} #${node.id}`
}

function getNodeColor(node: Node): string {
  // Use backgroundColor if available, otherwise use a default
  return node.backgroundColor || '#e5e7eb'
}
</script>
