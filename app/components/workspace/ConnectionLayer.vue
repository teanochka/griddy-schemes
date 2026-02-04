

<script setup lang="ts">
import { computed, ref } from 'vue'
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
  selectedConnectionId?: string | number | null
}>()

const emit = defineEmits<{
  'update:connection': [conn: Connection]
  'select-connection': [id: string | number]
}>()

// State for dragging segments
const draggingSegment = ref<{
  connId: string | number
  segmentIndex: number // Index of the start point of the segment in the points array
  isHorizontal: boolean
  startPos: { x: number, y: number }
} | null>(null)

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

// Convert points array to SVG path 'd'
function pointsToPath(points: { x: number, y: number }[]) {
  if (points.length === 0) return ''
  return `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
}

// Default orthogonal routing logic to generate points
function getOrthogonalPoints(
  start: { x: number, y: number },
  end: { x: number, y: number },
  startHandle: HandlePosition,
  endHandle: HandlePosition
) {
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
  
  // Create 6 points path (Start -> P1 -> MidA -> MidB -> P2 -> End)
  // This ensures we have movable segments in between
  
  // Basic layout: Start -> P1 -> (midX, p1.y) -> (midX, p2.y) -> P2 -> End
  const m1 = { x: midX, y: p1.y }
  const m2 = { x: midX, y: p2.y }
  
  return [start, p1, m1, m2, p2, end]
}

// Get points for a customized connection, or generate default ones
function getConnectionPoints(conn: Connection) {
  const sourceRect = getNodeRect(conn.sourceId)
  const targetRect = getNodeRect(conn.targetId)

  if (!sourceRect || !targetRect) return []

  const start = getHandlePosition(sourceRect, conn.sourceHandle)
  const end = getHandlePosition(targetRect, conn.targetHandle)
  
  if (conn.data?.waypoints && conn.data.waypoints.length > 0) {
    // If we have custom waypoints, stick them between start and end
    // NOTE: This assumes waypoints are the *intermediate* points
    return [start, ...conn.data.waypoints, end]
  }

  return getOrthogonalPoints(start, end, conn.sourceHandle, conn.targetHandle)
}

function getPath(conn: Connection) {
  const points = getConnectionPoints(conn)
  return pointsToPath(points)
}

// Segments logic
function getSegments(conn: Connection) {
  // Only show handles if selected? Or always?
  // Let's show on hover or selection. For now, assume selection passed via prop 
  // or just show all for testing if performance allows.
  // Ideally: props.selectedConnectionId === conn.id
  
  const points = getConnectionPoints(conn)
  const segments = []
  
  for (let i = 0; i < points.length - 1; i++) {
    const pA = points[i]
    const pB = points[i + 1]
    
    // Determine orientation
    const isHorizontal = Math.abs(pA.y - pB.y) < 1
    const isVertical = Math.abs(pA.x - pB.x) < 1
    
    // Skip tiny segments
    const length = Math.max(Math.abs(pA.x - pB.x), Math.abs(pA.y - pB.y))
    if (length < 10) continue
    
    // Skip segments attached directly to start/end if we want to enforce fixed exit?
    // Actually, allowing drag on P1-M1 is fine (changes padding).
    // Allowing drag on Start-P1 is NOT fine (changes alignment with handle).
    
    // Start is points[0], End is points[points.length - 1]
    // i=0 is Start->P1.
    // i=points.length-2 is P2->End.
    if (i === 0 || i === points.length - 2) continue
    
    const midX = (pA.x + pB.x) / 2
    const midY = (pA.y + pB.y) / 2
    
    segments.push({
      index: i,
      x: midX,
      y: midY,
      isHorizontal
    })
  }
  return segments
}


function onSegmentMouseDown(conn: Connection, segmentIndex: number, isHorizontal: boolean, e: MouseEvent) {
  e.stopPropagation() // Prevent selecting other things
  e.preventDefault()
  
  emit('select-connection', conn.id)
  
  // If no waypoints yet, we must materialize them!
  let waypoints = conn.data?.waypoints
  if (!waypoints || waypoints.length === 0) {
    const points = getConnectionPoints(conn)
    // Slice out start and end to get the intermediate waypoints
    waypoints = points.slice(1, -1)
    
    // Immediately save this structure so we can mutate it
    const newConn = { 
        ...conn, 
        data: { ...conn.data, waypoints } 
    }
    emit('update:connection', newConn)
  }
  
  draggingSegment.value = {
    connId: conn.id,
    segmentIndex,
    isHorizontal,
    startPos: { x: e.clientX, y: e.clientY }
  }
  
  window.addEventListener('mousemove', onSegmentDrag)
  window.addEventListener('mouseup', onSegmentDragEnd)
}

function onSegmentDrag(e: MouseEvent) {
  if (!draggingSegment.value) return
  
  const conn = props.connections.find(c => c.id === draggingSegment.value!.connId)
  if (!conn || !conn.data?.waypoints) return
  
  const { segmentIndex, isHorizontal } = draggingSegment.value
  // segmentIndex is index in the FULL points array (Start, W1, W2..., End)
  // Waypoints array corresponds to indices 1, 2, ...
  // Segment i connects points[i] and points[i+1]
  // points[i] corresponds to waypoints[i-1] (since points[0] is Start)
  
  // We need to update points[segmentIndex] and points[segmentIndex+1]
  // These map to waypoints[segmentIndex-1] and waypoints[segmentIndex]
  
  // Wait, if segmentIndex is 1 (P1->M1), we update P1 (waypoints[0]) and M1 (waypoints[1]).
  
  // Calculate delta
  // We need to convert screen delta to SVG delta?
  // Assuming 1:1 scale for now as SVG is absolute.
  // But wait, e.movementX might be better?
  // Or tracking absolute position.
  
  // Simple delta approach
  // We need to map client coordinates to SVG space if there's panning/zooming.
  // Workspace usually has panning.
  // BUT the SVG is inside the workspace container (relative).
  // `e.clientX` is global.
  // Use `movementX/Y` for simplicity.
  
  const dx = e.movementX
  const dy = e.movementY
  
  const w = [...conn.data.waypoints]
  
  const idx1 = segmentIndex - 1
  const idx2 = segmentIndex
  
  if (isHorizontal) {
    // Moving horizontal segment vertically (update Y)
    if (idx1 >= 0 && idx1 < w.length) w[idx1] = { ...w[idx1], y: w[idx1].y + dy }
    if (idx2 >= 0 && idx2 < w.length) w[idx2] = { ...w[idx2], y: w[idx2].y + dy }
  } else {
    // Moving vertical segment horizontally (update X)
    if (idx1 >= 0 && idx1 < w.length) w[idx1] = { ...w[idx1], x: w[idx1].x + dx }
    if (idx2 >= 0 && idx2 < w.length) w[idx2] = { ...w[idx2], x: w[idx2].x + dx }
  }
  
  // Update connection
  emit('update:connection', { 
    ...conn, 
    data: { ...conn.data, waypoints: w } 
  })
}

function onSegmentDragEnd() {
  draggingSegment.value = null
  window.removeEventListener('mousemove', onSegmentDrag)
  window.removeEventListener('mouseup', onSegmentDragEnd)
}

function getGhostPath() {
   // Legacy ghost path logic
  if (!props.drawingConnection || !props.mousePos) return ''
  const sourceRect = getNodeRect(props.drawingConnection.sourceId)
  if (!sourceRect) return ''
  const start = getHandlePosition(sourceRect, props.drawingConnection.sourceHandle)
  const end = props.mousePos
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`
}
</script>

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
      <!-- Main Path -->
      <path
        :d="getPath(conn)"
        fill="none"
        :stroke="selectedConnectionId === conn.id ? '#3b82f6' : '#9ca3af'"
        :stroke-width="selectedConnectionId === conn.id ? 3 : 2"
        marker-end="url(#arrowhead)"
        class="pointer-events-auto cursor-pointer"
        @click.stop="$emit('select-connection', conn.id)"
      />
      
      <!-- Drag Handles (Only if selected) -->
      <template v-if="selectedConnectionId === conn.id">
        <circle
          v-for="seg in getSegments(conn)"
          :key="seg.index"
          :cx="seg.x"
          :cy="seg.y"
          r="4"
          fill="white"
          stroke="#3b82f6"
          stroke-width="1.5"
          class="pointer-events-auto cursor-grab hover:fill-blue-100"
          @mousedown="onSegmentMouseDown(conn, seg.index, seg.isHorizontal, $event)"
        />
      </template>
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
