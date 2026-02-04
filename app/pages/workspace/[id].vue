<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LeftPanel from '@/components/panels/LeftPanel.vue'
import LayersPanel from '@/components/panels/LayersPanel.vue'
import DragImage from '@/components/DragImage.vue'
import CanvasNode from '@/components/workspace/CanvasNode.vue'
import ContextMenu from '@/components/panels/ContextMenu.vue'
import ConnectionLayer from '@/components/workspace/ConnectionLayer.vue'
import ConnectionHandles from '@/components/workspace/ConnectionHandles.vue'
import { isDragging, dragType, dragSource, endDrag } from '@/composables/useDrag'
import { useCursors } from '@/composables/useCursors'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'
import { createNode, getRootNodes } from '@/types/node'
import { componentRegistry } from '@/data/componentRegistry'
import type { Node } from '@/types/node'
import type { Connection, HandlePosition } from '@/types/connection'
import { useClipboard } from '@/composables/useClipboard'

const router = useRouter()
const route = useRoute()
const projectId = route.params.id as string

const { user } = useAuth()
const { inviteUser, getProjectContent } = useApi()

// if (!user.value) {
//   router.push('/login')
// }

const nodes = ref<Node[]>([])
const connections = ref<Connection[]>([])
const workspaceRef = ref<HTMLElement | null>(null)

// Connection state
const hoveredNodeId = ref<string | number | null>(null)
const drawingConnection = ref<{ sourceId: string | number, sourceHandle: HandlePosition } | null>(null)
const mousePos = ref<{ x: number, y: number } | null>(null)
const hoveredNode = computed(() => nodes.value.find(n => n.id === hoveredNodeId.value) || null)
const selectedConnectionId = ref<string | number | null>(null)

function onSelectConnection(id: string | number) {
  selectedConnectionId.value = id
  selectedNodeIds.value.clear() // Deselect nodes when selecting connection
}

function onUpdateConnection(updatedConn: Connection) {
  const index = connections.value.findIndex(c => c.id === updatedConn.id)
  if (index !== -1) {
    connections.value[index] = updatedConn
    syncCards()
  }
}


let hoverTimeout: any = null

function handleNodeHoverStart(id: string | number) {
  if (isDragging.value) return
  
  // Clear any pending clear timer
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
  
  hoveredNodeId.value = id
}

function handleNodeHoverEnd(id: string | number) {
  // Delay clearing to allow moving to handles
  if (hoveredNodeId.value === id) {
    hoverTimeout = setTimeout(() => {
      hoveredNodeId.value = null
    }, 100)
  }
}

function stopHoverClear() {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout)
    hoverTimeout = null
  }
}

function handleConnectStart(handle: HandlePosition, e: MouseEvent) {
  if (!hoveredNodeId.value || !workspaceRef.value) return
  
  const sourceId = hoveredNodeId.value
  drawingConnection.value = { sourceId, sourceHandle: handle }
  
  const rect = workspaceRef.value.getBoundingClientRect()
  mousePos.value = { 
    x: e.clientX - rect.left + workspaceRef.value.scrollLeft, 
    y: e.clientY - rect.top + workspaceRef.value.scrollTop 
  }
  
  window.addEventListener('mousemove', onConnectionDragMove)
  window.addEventListener('mouseup', onConnectionDragEnd)
}

function onConnectionDragMove(e: MouseEvent) {
  if (!workspaceRef.value) return
  const rect = workspaceRef.value.getBoundingClientRect()
  mousePos.value = { 
    x: e.clientX - rect.left + workspaceRef.value.scrollLeft, 
    y: e.clientY - rect.top + workspaceRef.value.scrollTop 
  }
}

function onConnectionDragEnd() {
  drawingConnection.value = null
  mousePos.value = null
  window.removeEventListener('mousemove', onConnectionDragMove)
  window.removeEventListener('mouseup', onConnectionDragEnd)
}

function handleConnectEnd(handle: HandlePosition) {
  if (drawingConnection.value && hoveredNodeId.value) {
    // If connecting to same node, deciding if we allow specific logic
    // For now allow self-connection if handles differ
    
    const newConn: Connection = {
      id: Date.now(),
      sourceId: drawingConnection.value.sourceId,
      targetId: hoveredNodeId.value,
      sourceHandle: drawingConnection.value.sourceHandle,
      targetHandle: handle,
      type: 'orthogonal',
      markerEnd: 'arrow'
    }
    
    connections.value.push(newConn)
    syncCards()
  }
  onConnectionDragEnd()
}

// Multi-selection state using Set for O(1) lookups
const selectedNodeIds = ref<Set<number | string>>(new Set())
const selectedNodes = computed(() =>
  nodes.value.filter((n) => selectedNodeIds.value.has(n.id))
)
const selectedNode = computed(() =>
  selectedNodeIds.value.size === 1 ? selectedNodes.value[0] ?? null : null
)

// Root nodes (nodes with no parent) - only these are rendered at top level
const rootNodes = computed(() => getRootNodes(nodes.value))

// Marquee selection state
const isMarqueeActive = ref(false)
const marqueeStart = ref({ x: 0, y: 0 })
const marqueeCurrent = ref({ x: 0, y: 0 })
const marqueeRect = computed(() => {
  const x1 = Math.min(marqueeStart.value.x, marqueeCurrent.value.x)
  const y1 = Math.min(marqueeStart.value.y, marqueeCurrent.value.y)
  const x2 = Math.max(marqueeStart.value.x, marqueeCurrent.value.x)
  const y2 = Math.max(marqueeStart.value.y, marqueeCurrent.value.y)
  return { x: x1, y: y1, width: x2 - x1, height: y2 - y1 }
})

// Clipboard for copy/paste
// Clipboard for copy/paste
const { copy, paste } = useClipboard()


const handleRemoteUpdate = (data: any) => {
  if (Array.isArray(data)) {
    // Legacy support for array of cards
    nodes.value = data
  } else if (data && typeof data === 'object') {
    // New format with cards and connections
    if (data.cards) nodes.value = data.cards
    if (data.connections) connections.value = data.connections
  }
}

const { cursors, sendCursor, sendData, connect } = useCursors(
  projectId,
  user.value?.nickname || 'Anon',
  handleRemoteUpdate
)

function syncCards() {
  sendData({ 
    type: 'update_cards', 
    data: {
      cards: nodes.value,
      connections: connections.value
    }
  })
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
  if (!n) return

  // Multi-node drag: if multiple nodes are selected and this node is selected
  if (selectedNodeIds.value.size > 1 && selectedNodeIds.value.has(id)) {
    // Calculate delta from old position
    const deltaX = x - n.x
    const deltaY = y - n.y

    // Apply delta to all selected nodes
    selectedNodes.value.forEach((node) => {
      node.x += deltaX
      node.y += deltaY
    })
  } else {
    // Single node drag
    n.x = x
    n.y = y
  }
  
  syncCards()
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

function onFieldsUpdate(node: Node, fields: Array<{ id: string; value: string }>) {
  node.fields = fields
  syncCards()
}

function onParentUpdate(id: number | string, parentId: number | string | null, insertIndex: number) {
  const node = nodes.value.find((n) => n.id === id)
  if (!node) return
  
  // Set the parent
  node.parentId = parentId
  
  // If inserting into a container, reorder to achieve proper insertion index
  if (parentId !== null) {
    // Get current children of the container (excluding the node being moved)
    const siblings = nodes.value.filter(n => n.parentId === parentId && n.id !== id)
    
    // Remove node from current position in array
    const nodeIdx = nodes.value.findIndex(n => n.id === id)
    if (nodeIdx !== -1) {
      nodes.value.splice(nodeIdx, 1)
    }
    
    // Find where to insert based on sibling positions
    // Children order in nodes array determines render order
    let insertPosition = nodes.value.length
    if (siblings.length > 0 && insertIndex < siblings.length) {
      const targetSibling = siblings[insertIndex]
      insertPosition = nodes.value.findIndex(n => n.id === targetSibling.id)
    } else if (siblings.length > 0) {
      // Insert after the last sibling
      const lastSibling = siblings[siblings.length - 1]
      insertPosition = nodes.value.findIndex(n => n.id === lastSibling.id) + 1
    }
    
    nodes.value.splice(insertPosition, 0, node)
  }
  
  syncCards()
}

function onSelectNode(node: Node, event?: MouseEvent) {
  const isCtrl = event?.ctrlKey || event?.metaKey
  const isShift = event?.shiftKey

  if (isCtrl) {
    // Toggle selection
    if (selectedNodeIds.value.has(node.id)) {
      selectedNodeIds.value.delete(node.id)
    } else {
      selectedNodeIds.value.add(node.id)
    }
    // Force reactivity
    selectedNodeIds.value = new Set(selectedNodeIds.value)
  } else {
    // If this node is already selected and multiple nodes are selected,
    // don't change selection (allows dragging the group)
    if (selectedNodeIds.value.size > 1 && selectedNodeIds.value.has(node.id)) {
      // Keep current selection for group drag
      return
    }
    
    // Regular click: clear and select this one
    selectedNodeIds.value = new Set([node.id])
  }
}

function onSelectChildNode(childId: number | string, event: MouseEvent) {
  const child = nodes.value.find(n => n.id === childId)
  if (child) {
    onSelectNode(child, event)
  }
}

function onReorderChildren(containerId: number | string, fromIndex: number, toIndex: number) {
  // Get all children of this container in current order
  const siblings = nodes.value.filter(n => n.parentId === containerId)
  
  if (fromIndex < 0 || fromIndex >= siblings.length || toIndex < 0 || toIndex >= siblings.length) {
    return
  }
  
  const movedNode = siblings[fromIndex]
  const targetNode = siblings[toIndex]
  
  // Find their indices in the global nodes array
  const globalMovedIdx = nodes.value.findIndex(n => n.id === movedNode.id)
  
  if (globalMovedIdx === -1) return
  
  // Remove from old position
  nodes.value.splice(globalMovedIdx, 1)
  
  // Find where to insert
  // We need to find the global index of the target node
  // If we're moving down (from < to), we want to be AFTER the target
  // If we're moving up (from > to), we want to be BEFORE the target
  // BUT since we already removed the node, the target's index might have shifted if it was after the moved node
  const globalTargetIdx = nodes.value.findIndex(n => n.id === targetNode.id)
  
  // Insert at the new position
  // If moving down, toIndex > fromIndex. In siblings array, we want to be at toIndex.
  // Since we removed the node, the target node is now at the position we want to be (if moving up) 
  // or before the position we want (if moving down? wait).
  
  // Simpler logic:
  // We want to insert 'movedNode' such that it ends up at 'toIndex' in the siblings array.
  // The 'siblings' array we got earlier is the OLD order.
  // Let's re-calculate insertion point based on the remaining nodes in global array.
  
  let insertPos = globalTargetIdx
  if (fromIndex < toIndex) {
    // Moving down. Target is now logically "before" where we want to be?
    // Example: [A, B, C]. Move A(0) to C(2). ToIndex=2. Target=C.
    // Remove A. Nodes: [B, C]. Target C is at index 1.
    // We want A to be after C. So insert at TargetIdx + 1.
    insertPos = globalTargetIdx + 1
  } else {
    // Moving up. Example: [A, B, C]. Move C(2) to A(0). ToIndex=0. Target=A.
    // Remove C. Nodes: [A, B]. Target A is at index 0.
    // We want C to be before A. So insert at TargetIdx.
    insertPos = globalTargetIdx
  }
  
  nodes.value.splice(insertPos, 0, movedNode)
  syncCards()
}

function onWorkspaceMousedown(e: MouseEvent) {
  // Check if clicking on empty space (not a node)
  const target = e.target as HTMLElement
  if (target.closest('.canvas-node')) return

  // Clear selection unless modifier key is held
  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
    selectedNodeIds.value = new Set()
    selectedConnectionId.value = null
  }

  // Start marquee selection
  if (!workspaceRef.value) return
  const rect = workspaceRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left + workspaceRef.value.scrollLeft
  const y = e.clientY - rect.top + workspaceRef.value.scrollTop

  isMarqueeActive.value = true
  marqueeStart.value = { x, y }
  marqueeCurrent.value = { x, y }

  window.addEventListener('mousemove', onMarqueeMove)
  window.addEventListener('mouseup', onMarqueeEnd)
}

function onMarqueeMove(e: MouseEvent) {
  if (!isMarqueeActive.value || !workspaceRef.value) return
  const rect = workspaceRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left + workspaceRef.value.scrollLeft
  const y = e.clientY - rect.top + workspaceRef.value.scrollTop
  marqueeCurrent.value = { x, y }
}

function onMarqueeEnd(e: MouseEvent) {
  if (!isMarqueeActive.value) return

  // Calculate which nodes intersect with marquee
  const selected = new Set<number | string>()
  const rect = marqueeRect.value

  nodes.value.forEach((node) => {
    // Check if node intersects with marquee rectangle
    const nodeRight = node.x + node.width
    const nodeBottom = node.y + node.height
    const rectRight = rect.x + rect.width
    const rectBottom = rect.y + rect.height

    const intersects = (
      node.x < rectRight &&
      nodeRight > rect.x &&
      node.y < rectBottom &&
      nodeBottom > rect.y
    )

    if (intersects) {
      selected.add(node.id)
    }
  })

  // If Shift/Ctrl held, union with existing selection, otherwise replace
  if (e.ctrlKey || e.metaKey || e.shiftKey) {
    selectedNodeIds.value = new Set([...selectedNodeIds.value, ...selected])
  } else {
    selectedNodeIds.value = selected
  }

  isMarqueeActive.value = false
  window.removeEventListener('mousemove', onMarqueeMove)
  window.removeEventListener('mouseup', onMarqueeEnd)
}

function handleLayerSelect(id: number | string, event?: MouseEvent) {
  const isCtrl = event?.ctrlKey || event?.metaKey
  const isShift = event?.shiftKey

  if (isCtrl) {
    // Toggle selection
    if (selectedNodeIds.value.has(id)) {
      selectedNodeIds.value.delete(id)
    } else {
      selectedNodeIds.value.add(id)
    }
    selectedNodeIds.value = new Set(selectedNodeIds.value)
  } else if (isShift && selectedNodeIds.value.size > 0) {
    // Range selection
    const lastSelected = Array.from(selectedNodeIds.value)[selectedNodeIds.value.size - 1]
    const lastIndex = nodes.value.findIndex(n => n.id === lastSelected)
    const currentIndex = nodes.value.findIndex(n => n.id === id)

    if (lastIndex !== -1 && currentIndex !== -1) {
      const start = Math.min(lastIndex, currentIndex)
      const end = Math.max(lastIndex, currentIndex)
      const range = nodes.value.slice(start, end + 1).map(n => n.id)
      selectedNodeIds.value = new Set([...selectedNodeIds.value, ...range])
    }
  } else {
    // Regular click: select only this one
    selectedNodeIds.value = new Set([id])
  }
}

function handleLayerReorder(newOrder: Node[]) {
  nodes.value = newOrder
  syncCards()
}

function onDeleteNode(id: number | string) {
  // Delete all selected nodes if multiple are selected and this node is in the selection
  if (selectedNodeIds.value.size > 1 && selectedNodeIds.value.has(id)) {
    nodes.value = nodes.value.filter(n => !selectedNodeIds.value.has(n.id))
    selectedNodeIds.value = new Set()
  } else {
    // Delete single node
    const index = nodes.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      nodes.value.splice(index, 1)
      selectedNodeIds.value.delete(id)
      selectedNodeIds.value = new Set(selectedNodeIds.value)
    }
  }

  // Remove connections attached to deleted nodes
  // We need to know which IDs were deleted. 
  // If multiple (selectedNodeIds), they are gone from nodes.value.
  // We need to filter connections based on existence in nodes.value?
  // Or just filter out invalid connections?
  // Safer to filter connections where source/target no longer exist in nodes.value.
  const nodeIds = new Set(nodes.value.map(n => n.id))
  connections.value = connections.value.filter(c => 
    nodeIds.has(c.sourceId) && nodeIds.has(c.targetId)
  )

  syncCards()
}

function handleKeyDown(e: KeyboardEvent) {
  // Ignore if typing in input/textarea/contenteditable
  const target = e.target as HTMLElement
  if (target.matches('input, textarea, [contenteditable="true"]')) {
    return
  }

  const isCtrl = e.ctrlKey || e.metaKey

  // Copy (Ctrl+C)
  if (isCtrl && e.code === 'KeyC') {
    if (selectedNodeIds.value.size > 0) {
      e.preventDefault()
      copy(selectedNodes.value)
    }
  }

  // Cut (Ctrl+X)
  if (isCtrl && e.code === 'KeyX') {
    if (selectedNodeIds.value.size > 0) {
      e.preventDefault()
      copy(selectedNodes.value)
      // Delete original nodes
      nodes.value = nodes.value.filter(n => !selectedNodeIds.value.has(n.id))
      // Remove connections attached to cut nodes
      connections.value = connections.value.filter(c => 
        !selectedNodeIds.value.has(c.sourceId) && !selectedNodeIds.value.has(c.targetId)
      )
      selectedNodeIds.value = new Set()
      syncCards()
    }
  }

  // Paste (Ctrl+V)
  if (isCtrl && e.code === 'KeyV') {
    e.preventDefault()
    paste().then((newNodes) => {
      if (newNodes.length > 0) {
        nodes.value.push(...newNodes)
        // Select the pasted nodes
        selectedNodeIds.value = new Set(newNodes.map(n => n.id))
        syncCards()
      }
    })
  }

  // Delete on Delete or Backspace
  if (e.key === 'Delete' || e.key === 'Backspace') {
    let changed = false
    
    // Delete selected nodes
    if (selectedNodeIds.value.size > 0) {
      e.preventDefault() 
      nodes.value = nodes.value.filter(n => !selectedNodeIds.value.has(n.id))
      // Remove connections attached to deleted nodes
      connections.value = connections.value.filter(c => 
        !selectedNodeIds.value.has(c.sourceId) && !selectedNodeIds.value.has(c.targetId)
      )
      selectedNodeIds.value = new Set()
      changed = true
    }
    
    // Delete selected connection
    if (selectedConnectionId.value) {
      e.preventDefault()
      connections.value = connections.value.filter(c => c.id !== selectedConnectionId.value)
      selectedConnectionId.value = null
      changed = true
    }
    
    if (changed) syncCards()
  }
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
  window.addEventListener('keydown', handleKeyDown)
  connect()
  try {
    const data = await getProjectContent(projectId)
    if (data) {
      if (Array.isArray(data.cards)) {
        nodes.value = data.cards
      }
      if (Array.isArray(data.connections)) {
        connections.value = data.connections
      }
    }
  } catch (e) {
    console.error('Ошибка загрузки проекта', e)
  }
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleGlobalMouseUp)
  window.removeEventListener('keydown', handleKeyDown)
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

        <ConnectionLayer
          :connections="connections"
          :nodes="nodes"
          :drawing-connection="drawingConnection"
          :mouse-pos="mousePos"
          :selected-connection-id="selectedConnectionId"
          @update:connection="onUpdateConnection"
          @select-connection="onSelectConnection"
        />

        <ContextMenu
          v-if="selectedNode"
          :node="selectedNode"
          @update:node="syncCards"
        />

        <CanvasNode
          v-for="node in rootNodes"
          :key="node.id"
          class="canvas-node"
          :node="node"
          :all-nodes="nodes"
          :workspace-ref="workspaceRef"
          :selected="selectedNodeIds.has(node.id)"
          :selected-node-ids="selectedNodeIds"
          @update:position="onPositionUpdate"
          @update:size="onSizeUpdate"
          @update:content="(v) => onContentUpdate(node, v)"
          @update:fields="(v) => onFieldsUpdate(node, v)"
          @update:parent="onParentUpdate"
          @select="(e) => onSelectNode(node, e)"
          @select-child="onSelectChildNode"
          @reorder-children="onReorderChildren"
          @hover-start="handleNodeHoverStart"
          @hover-end="handleNodeHoverEnd"
          @delete="onDeleteNode(node.id)"
        />

        <ConnectionHandles
          v-if="hoveredNode && !hoveredNode.parentId && (!isDragging || drawingConnection)"
          :node="hoveredNode"
          @connect-start="handleConnectStart"
          @connect-end="handleConnectEnd"
          @mouseenter="stopHoverClear"
          @mouseleave="handleNodeHoverEnd(hoveredNodeId!)"
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

        <!-- Marquee Selection Rectangle -->
        <div
          v-if="isMarqueeActive"
          class="absolute pointer-events-none border-2 border-blue-500 bg-blue-100/20 z-[9998]"
          :style="{
            left: `${marqueeRect.x}px`,
            top: `${marqueeRect.y}px`,
            width: `${marqueeRect.width}px`,
            height: `${marqueeRect.height}px`,
          }"
        />
      </div>

      <LayersPanel
        :nodes="nodes"
        :selected-node-ids="Array.from(selectedNodeIds)"
        @select="handleLayerSelect"
        @reorder="handleLayerReorder"
      />
    </div>
  </div>
</template>
