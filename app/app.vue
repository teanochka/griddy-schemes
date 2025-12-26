<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import DragImage from '@/components/DragImage.vue'
import DraggableCard from '@/components/DraggableCard.vue'
import { isDragging, dragType, endDrag } from '@/composables/useDrag'

const workspaceRef = ref(null)
const cards = ref([])

function handleGlobalMouseUp(e) {
  if (!isDragging.value) return

  const rect = workspaceRef.value.getBoundingClientRect()

  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom

  if (inside) {
    cards.value.push({
      id: Date.now(),
      type: dragType.value,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      width: 120,
      height: 120,
      content: 'Новый элемент',
      style: {}
    })
  }

  endDrag()
}

onMounted(() => {
  window.addEventListener('mouseup', handleGlobalMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleGlobalMouseUp)
})
</script>

<template>
  <div class="flex h-screen">
    <Sidebar />
    <DragImage />

    <div
      ref="workspaceRef"
      class="workspace flex-1 relative overflow-hidden"
    >
      <DraggableCard
        v-for="card in cards"
        :key="card.id"
        :card="card"
        @update:position="(id, x, y) => {
          const c = cards.find(c => c.id === id)
          if (c) { c.x = x; c.y = y }
        }"
      />
    </div>
  </div>
</template>
