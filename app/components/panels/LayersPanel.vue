<template>
  <div class="w-64 bg-slate-50 border-l border-gray-300 h-full flex flex-col overflow-hidden">
    <div class="font-black text-slate-800 text-xl py-4 px-4 shrink-0">Слои</div>

    <div class="flex-1 overflow-y-auto px-4 pb-4">
      <div v-if="nodes.length === 0" class="text-sm text-gray-500 text-center py-8">
        Нет слоёв
      </div>

      <div v-else class="space-y-0.5">
        <LayerItem
          v-for="node in reversedRootNodes"
          :key="node.id"
          :node="node"
          :all-nodes="nodes"
          :depth="0"
          :selected-node-ids="selectedNodeIds"
          :expanded-ids="expandedIds"
          @select="handleSelect"
          @toggle-expand="toggleExpand"
          @reorder="handleReorder"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Node } from '@/types/node'
import { getRootNodes } from '@/types/node'
import LayerItem from './LayerItem.vue'

const props = defineProps<{
  nodes: Node[]
  selectedNodeIds: (number | string)[]
}>()

const emit = defineEmits<{
  select: [id: number | string, event?: MouseEvent]
  reorder: [newOrder: Node[]]
}>()

const expandedIds = ref<Set<number | string>>(new Set())

const reversedRootNodes = computed(() => {
  return [...getRootNodes(props.nodes)].reverse()
})

function handleSelect(id: number | string, event?: MouseEvent) {
  emit('select', id, event)
}

function toggleExpand(id: number | string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
  expandedIds.value = new Set(expandedIds.value)
}

function handleReorder(fromId: number | string, toId: number | string) {
  // Find the indices in the original nodes array
  const fromIndex = props.nodes.findIndex(n => String(n.id) === String(fromId))
  const toIndex = props.nodes.findIndex(n => String(n.id) === String(toId))
  
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
  
  const newNodes = [...props.nodes]
  const [moved] = newNodes.splice(fromIndex, 1)
  newNodes.splice(toIndex, 0, moved)
  
  emit('reorder', newNodes)
}
</script>
