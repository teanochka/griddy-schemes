<template>
  <div
    ref="cardRef"
    class="absolute cursor-move select-none transition-all duration-200
           shadow-sm hover:shadow-md bg-white border border-gray-300 rounded-lg
           opacity-100 z-10 min-w-20 min-h-20"
    :class="{
      'opacity-80 shadow-2xl z-50 cursor-grabbing': isDragging,
    }"
    :style="{
      left: `${card.x}px`,
      top: `${card.y}px`,
      width: `${card.width}px`,
      height: `${card.height}px`,
      ...card.style,
    }"
    @dblclick="handleDoubleClick"
    @mousedown.prevent="onMouseDown"
  >

    <div class="w-full h-full p-2 flex items-center justify-center relative">
      <input 
      ref="contentInput"
      type="text" 
      class="text-gray-700 text-sm w-fit" 
      v-model="card.content" />
      <div
        @mousedown.stop="startResize"
        class="absolute bottom-[-15px] right-[-15px] w-8 h-8 cursor-se-resize bg-black"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:position', 'remove'])

const cardRef = ref(null)
const isDragging = ref(false)
const isResizing = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const showControls = ref(false)

function onMouseDown(e) {
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - props.card.x,
    y: e.clientY - props.card.y
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e) {
  emit(
    'update:position',
    props.card.id,
    e.clientX - dragOffset.value.x,
    e.clientY - dragOffset.value.y
  )
}

function onMouseUp() {
  isDragging.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}
function startResize(e) {
  isResizing.value = true
  e.stopPropagation()

  const startX = e.clientX
  const startY = e.clientY
  const startWidth = props.card.width
  const startHeight = props.card.height

  function onResizeMouseMove(e) {
    const newWidth = startWidth + (e.clientX - startX)
    const newHeight = startHeight + (e.clientY - startY)

    props.card.width = Math.max(newWidth, 50)
    props.card.height = Math.max(newHeight, 50)
  }

  function onResizeMouseUp() {
    isResizing.value = false
    window.removeEventListener('mousemove', onResizeMouseMove)
    window.removeEventListener('mouseup', onResizeMouseUp)
  }

  window.addEventListener('mousemove', onResizeMouseMove)
  window.addEventListener('mouseup', onResizeMouseUp)
}

const handleDoubleClick = () => {
    if (cardRef.value) {
      const input = cardRef.value.querySelector('input')
      if (input) {
        input.focus()
        input.select()
      }
  }
}

onMounted(() => {
  cardRef.value.addEventListener('mouseenter', () => {
    showControls.value = true
  })
  
  cardRef.value.addEventListener('mouseleave', () => {
    if (!isDragging.value && !isResizing.value) {
      showControls.value = false
    }
  })
})
</script>