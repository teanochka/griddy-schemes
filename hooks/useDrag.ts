import { ref } from 'vue'

export const isDragging = ref(false)
export const dragType = ref<string | null>(null)
export const dragPosition = ref({ x: 0, y: 0 })
export const dragSource = ref<'sidebar' | 'workspace' | null>(null)

export function startDrag(type: string, e: MouseEvent, source = 'sidebar') {
  isDragging.value = true
  dragType.value = type
  dragSource.value = source
  dragPosition.value = { x: e.clientX, y: e.clientY }
}

export function updateDrag(e: MouseEvent) {
  dragPosition.value = { x: e.clientX, y: e.clientY }
}

export function endDrag() {
  isDragging.value = false
  dragType.value = null
  dragSource.value = null
}
