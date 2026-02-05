<template>
  <div>
    <!-- Node row -->
    <div
      :draggable="true"
      class="flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-colors group relative"
      :class="{
        'bg-blue-100 border border-blue-400': isSelected,
        'hover:bg-slate-200/80 border border-transparent': !isSelected,
        'border-t-2 border-t-blue-500': isDragOver,
      }"
      :style="{ paddingLeft: `${8 + depth * 16}px` }"
      @click="$emit('select', node.id, $event)"
      @dragstart="onDragStart"
      @dragover.prevent="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <!-- Expand/collapse toggle for containers -->
      <button
        v-if="isContainerWithPotentialChildren"
        type="button"
        class="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 shrink-0"
        @click.stop="$emit('toggle-expand', node.id)"
      >
        <svg
          version="1.0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512.000000 512.000000"
          preserveAspectRatio="xMidYMid meet"
          class="w-3 h-3 transition-transform duration-200"
          :class="{ '-rotate-90': !isExpanded }"
        >
          <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
            <path d="M415 4146 c-69 -30 -111 -124 -85 -190 11 -30 2062 -2877 2109 -2929 36 -40 73 -57 121 -57 48 0 85 17 121 57 60 65 2101 2905 2110 2935 21 72 -19 155 -88 184 -48 20 -4242 20 -4288 0z"/>
          </g>
        </svg>
      </button>
      <div v-else class="w-4 shrink-0" />

      <!-- Icon representing the node type -->
      <div
        class="w-6 h-6 shrink-0 rounded border flex items-center justify-center text-[10px] font-medium"
        :style="{ backgroundColor: getNodeColor(node), borderColor: '#9ca3af' }"
      >
        {{ getNodeLabel(node) }}
      </div>

      <!-- Node name -->
      <span class="text-sm text-gray-800 truncate flex-1" :title="getNodeName(node)">
        {{ getNodeName(node) }}
      </span>
    </div>

    <!-- Children (recursive) -->
    <div v-if="isContainerWithPotentialChildren && isExpanded">
      <LayerItem
        v-for="child in reversedChildren"
        :key="child.id"
        :node="child"
        :all-nodes="allNodes"
        :depth="depth + 1"
        :selected-node-ids="selectedNodeIds"
        :expanded-ids="expandedIds"
        @select="(id, e) => $emit('select', id, e)"
        @toggle-expand="(id) => $emit('toggle-expand', id)"
        @reorder="(fromId, toId) => $emit('reorder', fromId, toId)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Node } from '@/types/node'
import { getChildren, isContainer } from '@/types/node'

const props = defineProps<{
  node: Node
  allNodes: Node[]
  depth: number
  selectedNodeIds: (number | string)[]
  expandedIds: Set<number | string>
}>()

const emit = defineEmits<{
  select: [id: number | string, event?: MouseEvent]
  'toggle-expand': [id: number | string]
  reorder: [fromId: number | string, toId: number | string]
}>()

const isDragOver = ref(false)

const children = computed(() => getChildren(props.allNodes, props.node.id))
const reversedChildren = computed(() => [...children.value].reverse())
const isContainerWithPotentialChildren = computed(() => isContainer(props.node))
const isExpanded = computed(() => props.expandedIds.has(props.node.id))
const isSelected = computed(() => props.selectedNodeIds.includes(props.node.id))

function onDragStart(e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(props.node.id))
  }
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const fromId = e.dataTransfer?.getData('text/plain')
  if (fromId && fromId !== String(props.node.id)) {
    emit('reorder', fromId, props.node.id)
  }
}

function getNodeLabel(node: Node): string {
  if (node.content && typeof node.content === 'string') {
    return node.content.slice(0, 2).toUpperCase() || node.type.slice(0, 2).toUpperCase()
  }
  return node.type.slice(0, 2).toUpperCase()
}

function getNodeName(node: Node): string {
  if (node.content && typeof node.content === 'string' && node.content.trim()) {
    return node.content.length > 20 ? node.content.slice(0, 20) + '...' : node.content
  }
  return `${node.type} #${node.id}`
}

function getNodeColor(node: Node): string {
  return node.backgroundColor || '#e5e7eb'
}
</script>
