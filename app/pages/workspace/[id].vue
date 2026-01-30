<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LeftPanel from '@/components/panels/LeftPanel.vue'
import LayersPanel from '@/components/panels/LayersPanel.vue'
import DragImage from '@/components/DragImage.vue'
import CanvasNode from '@/components/workspace/CanvasNode.vue'
import ContextMenu from '@/components/panels/ContextMenu.vue'
import { isDragging, dragType, dragSource, endDrag } from '@/composables/useDrag'
import { useCursors } from '@/composables/useCursors'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'
import { createNode } from '@/types/node'
import { componentRegistry } from '@/data/componentRegistry'
import type { Node } from '@/types/node'

const router = useRouter()
const route = useRoute()
const projectId = route.params.id as string

const { user } = useAuth()
const { inviteUser, getProjectContent } = useApi()

// if (!user.value) {
//   router.push('/login')
// }

const nodes = ref<Node[]>([])
const workspaceRef = ref<HTMLElement | null>(null)
const selectedNodeId = ref<number | string | null>(null)
const selectedNode = computed(() =>
  selectedNodeId.value ? nodes.value.find((n) => n.id === selectedNodeId.value) ?? null : null
)

const handleRemoteUpdate = (remoteCards: Node[]) => {
  nodes.value = remoteCards ?? []
}

const { cursors, sendCursor, sendData, connect } = useCursors(
  projectId,
  user.value?.nickname || 'Anon',
  handleRemoteUpdate
)

function syncCards() {
  sendData({ type: 'update_cards', cards: nodes.value })
}

function handleWorkspaceMouseMove(e: MouseEvent) {
  if (!workspaceRef.value) return
  const rect = workspaceRef.value.getBoundingClientRect()
  sendCursor(e.clientX - rect.left, e.clientY - rect.top)
}

function handleGlobalMouseUp(e: MouseEvent) {
  if (!isDragging.value || !workspaceRef.value) {
    endDrag()
    return
  }
  const rect = workspaceRef.value.getBoundingClientRect()
  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom

  if (inside && dragSource.value === 'sidebar' && dragType.value) {
    const def = componentRegistry.getDefaults(dragType.value)
    if (def) {
      const x = Math.round(e.clientX - rect.left)
      const y = Math.round(e.clientY - rect.top)
      const node = createNode(dragType.value, { x, y }, def)
      nodes.value.push(node)
      syncCards()
    }
  }
  endDrag()
}

function onPositionUpdate(id: number | string, x: number, y: number) {
  const n = nodes.value.find((c) => c.id === id)
  if (n) {
    n.x = x
    n.y = y
    syncCards()
  }
}

function onSizeUpdate(id: number | string, w: number, h: number) {
  const n = nodes.value.find((c) => c.id === id)
  if (n) {
    n.width = w
    n.height = h
    syncCards()
  }
}

function onContentUpdate(node: Node, value: string) {
  node.content = value
  syncCards()
}

function onSelectNode(node: Node) {
  selectedNodeId.value = node.id
}

function onWorkspaceMousedown() {
  selectedNodeId.value = null
}

function handleLayerSelect(id: number | string) {
  selectedNodeId.value = id
}

function handleLayerReorder(newOrder: Node[]) {
  nodes.value = newOrder
  syncCards()
}

const inviteInput = ref('')
const inviteStatus = ref('')
async function handleInvite() {
  if (!inviteInput.value) return
  try {
    await inviteUser(projectId, inviteInput.value)
    inviteStatus.value = `OK: ${inviteInput.value}`
    inviteInput.value = ''
  } catch (e) {
    inviteStatus.value = 'Ошибка'
  }
}

onMounted(async () => {
  window.addEventListener('mouseup', handleGlobalMouseUp)
  connect()
  try {
    const data = await getProjectContent(projectId)
    if (data && Array.isArray(data.cards)) {
      nodes.value = data.cards
    }
  } catch (e) {
    console.error('Ошибка загрузки проекта', e)
  }
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleGlobalMouseUp)
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <header class="h-14 bg-white border-b flex items-center justify-between px-6 z-50 shrink-0">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-gray-500 hover:text-black text-sm">← Назад</NuxtLink>
        <h1 class="font-bold text-gray-800">Проект #{{ projectId }}</h1>
      </div>
      <div class="flex gap-2">
        <span class="text-sm text-gray-500 self-center">{{ inviteStatus }}</span>
        <input v-model="inviteInput" placeholder="Invite user..." class="border px-2 py-1 text-sm rounded" />
        <button type="button" class="bg-blue-600 text-white px-3 py-1 rounded text-sm" @click="handleInvite">
          Add
        </button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden min-h-0">
      <LeftPanel />
      <DragImage />

      <div
        ref="workspaceRef"
        class="workspace flex-1 relative overflow-auto bg-slate-50"
        @mousemove="handleWorkspaceMouseMove"
        @mousedown="onWorkspaceMousedown"
      >
        <div
          class="absolute inset-0 opacity-10 pointer-events-none min-w-full min-h-full"
          style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;"
        />

        <ContextMenu
          v-if="selectedNode"
          :node="selectedNode"
          @update:node="syncCards"
        />

        <CanvasNode
          v-for="node in nodes"
          :key="node.id"
          :node="node"
          :workspace-ref="workspaceRef"
          :selected="selectedNodeId === node.id"
          @update:position="onPositionUpdate"
          @update:size="onSizeUpdate"
          @update:content="(v) => onContentUpdate(node, v)"
          @select="onSelectNode(node)"
        />

        <div
          v-for="(cursor, userKey) in cursors"
          :key="String(userKey)"
          class="absolute pointer-events-none z-[9999] transition-all duration-100 ease-linear"
          :style="{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" :fill="cursor.color" class="drop-shadow-md">
            <path
              d="M5.5,2.5 L18.5,14.5 L12.5,14.5 L15.5,21.5 L12.5,22.5 L9.5,15.5 L5.5,19.5 Z"
              stroke="white"
              stroke-width="1.5"
            />
          </svg>
          <span
            class="ml-4 -mt-3 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-80 whitespace-nowrap"
          >
            {{ userKey }}
          </span>
        </div>
      </div>

      <LayersPanel
        :nodes="nodes"
        :selected-node-id="selectedNodeId"
        @select="handleLayerSelect"
        @reorder="handleLayerReorder"
      />
    </div>
  </div>
</template>
