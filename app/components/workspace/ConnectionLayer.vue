<template>
  <svg class="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-10">
    <defs>
      <marker
        id="arrowhead"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" />
      </marker>
      <marker
        id="arrowhead-selected"
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
      </marker>
    </defs>

    <g v-for="conn in connections" :key="conn.id">
      <path
        :d="getPath(conn)"
        fill="none"
        stroke="#9ca3af"
        stroke-width="2"
        marker-end="url(#arrowhead)"
      />
    </g>

    <!-- Ghost connection while dragging -->
    <g v-if="drawingConnection && mousePos">
      <path
        :d="getGhostPath()"
        fill="none"
        stroke="#3b82f6"
        stroke-width="2"
        stroke-dasharray="5,5"
        marker-end="url(#arrowhead-selected)"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/types/node'
import type { Connection, HandlePosition } from '@/types/connection'

const props = defineProps<{
  connections: Connection[]
  nodes: Node[]
  drawingConnection?: {
    sourceId: string | number
    sourceHandle: HandlePosition
  } | null
  mousePos?: { x: number, y: number } | null
}>()

function getNodeRect(id: string | number) {
  const node = props.nodes.find((n) => n.id === id)
  if (!node) return null
  return {
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  }
}

function getHandlePosition(rect: { x: number, y: number, width: number, height: number }, handle: HandlePosition) {
  switch (handle) {
    case 'top':
      return { x: rect.x + rect.width / 2, y: rect.y }
    case 'right':
      return { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
    case 'bottom':
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
    case 'left':
      return { x: rect.x, y: rect.y + rect.height / 2 }
  }
}

function getPath(conn: Connection) {
  const sourceRect = getNodeRect(conn.sourceId)
  const targetRect = getNodeRect(conn.targetId)

  if (!sourceRect || !targetRect) return ''

  const start = getHandlePosition(sourceRect, conn.sourceHandle)
  const end = getHandlePosition(targetRect, conn.targetHandle)

  return getOrthogonalPath(start, end, conn.sourceHandle, conn.targetHandle)
}

function getGhostPath() {
  if (!props.drawingConnection || !props.mousePos) return ''
  
  const sourceRect = getNodeRect(props.drawingConnection.sourceId)
  if (!sourceRect) return ''
  
  const start = getHandlePosition(sourceRect, props.drawingConnection.sourceHandle)
  const end = props.mousePos
  
  // Estimate target handle based on direction (simplified)
  // Or just use straight line for ghost
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
}

function getOrthogonalPath(
  start: { x: number, y: number },
  end: { x: number, y: number },
  startHandle: HandlePosition,
  endHandle: HandlePosition
) {
  // Simple orthogonal routing
  const padding = 20
  
  let p1 = { ...start }
  let p2 = { ...end }
  
  // Extend out from handles
  switch(startHandle) {
    case 'top': p1.y -= padding; break;
    case 'bottom': p1.y += padding; break;
    case 'left': p1.x -= padding; break;
    case 'right': p1.x += padding; break;
  }
  
  switch(endHandle) {
    case 'top': p2.y -= padding; break;
    case 'bottom': p2.y += padding; break;
    case 'left': p2.x -= padding; break;
    case 'right': p2.x += padding; break;
  }
  
  // Midpoint logic
  const midX = (p1.x + p2.x) / 2
  const midY = (p1.y + p2.y) / 2
  
  // Decide major axis
  return `M ${start.x} ${start.y} 
          L ${p1.x} ${p1.y} 
          L ${midX} ${p1.y}
          L ${midX} ${p2.y}
          L ${p2.x} ${p2.y}
          L ${end.x} ${end.y}`
}
</script>
