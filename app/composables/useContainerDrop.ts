import { ref, computed } from 'vue'
import type { Node } from '@/types/node'
import { isContainer } from '@/types/node'

/**
 * State for container drop detection during drag operations
 */
export const hoveredContainerId = ref<number | string | null>(null)
export const ghostRect = ref<{ x: number; y: number; width: number; height: number } | null>(null)

/**
 * Check if a point is inside a container's bounds
 */
export function isPointInContainer(
    x: number,
    y: number,
    container: Node
): boolean {
    return (
        x >= container.x &&
        x <= container.x + container.width &&
        y >= container.y &&
        y <= container.y + container.height
    )
}

/**
 * Find which container (if any) the mouse is hovering over
 * Returns the topmost (last in array) container that contains the point
 */
export function findHoveredContainer(
    mouseX: number,
    mouseY: number,
    containers: Node[],
    excludeId?: number | string
): Node | null {
    // Iterate in reverse to get topmost container first
    for (let i = containers.length - 1; i >= 0; i--) {
        const container = containers[i]
        if (!container) continue
        if (excludeId !== undefined && container.id === excludeId) continue
        if (isPointInContainer(mouseX, mouseY, container)) {
            return container
        }
    }
    return null
}

/**
 * Calculate the ghost position within a container
 * Ghost coordinates are relative to container's position
 */
export function calculateGhostInContainer(
    mouseX: number,
    mouseY: number,
    container: Node,
    nodeWidth: number,
    nodeHeight: number
): { x: number; y: number; width: number; height: number } {
    // Position ghost centered on mouse, but relative to container
    const relX = mouseX - container.x - nodeWidth / 2
    const relY = mouseY - container.y - nodeHeight / 2

    return {
        x: Math.max(0, relX),
        y: Math.max(0, relY),
        width: nodeWidth,
        height: nodeHeight,
    }
}

/**
 * Update container hover state during drag
 */
export function updateContainerHover(
    mouseX: number,
    mouseY: number,
    containers: Node[],
    draggedNodeSize: { width: number; height: number },
    excludeId?: number | string
) {
    const container = findHoveredContainer(mouseX, mouseY, containers, excludeId)

    if (container) {
        hoveredContainerId.value = container.id
        ghostRect.value = calculateGhostInContainer(
            mouseX,
            mouseY,
            container,
            draggedNodeSize.width,
            draggedNodeSize.height
        )
    } else {
        hoveredContainerId.value = null
        ghostRect.value = null
    }
}

/**
 * Clear container hover state
 */
export function clearContainerHover() {
    hoveredContainerId.value = null
    ghostRect.value = null
}
