<template>
  <div class="w-1/4 bg-slate-50 border-r border-gray-300 h-screen flex flex-col">

    <!-- Drag Image компонент (рендерится всегда, но скрыт) -->
    <DragImage
      ref="dragImageRef"
      :visible="isDragging"
      :type="currentDragType"

      :x="-1000"
      :y="-1000"
    />

    <div class="font-black text-slate-800 text-xl py-6 px-4">Компоненты</div>
    
    <!-- Разделы с компонентами -->
    <div class="px-4 pb-4">
      <h3 class="font-semibold text-gray-700 mb-3">Базовые элементы</h3>
      <div class="space-y-2">
        <!-- Карточка -->
         <div class="flex items-center p-3 cursor-grab hover:bg-slate-200 rounded-lg"
         @mousedown.prevent="onMouseDown($event, 'basic-card')"
         >
        Карточка</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { startDrag, updateDrag, endDrag } from '@/composables/useDrag'

function onMouseDown(e, type) {
  startDrag(type, e, 'sidebar')

  window.addEventListener('mousemove', updateDrag)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseUp() {
  endDrag()
  window.removeEventListener('mousemove', updateDrag)
  window.removeEventListener('mouseup', onMouseUp)
}
</script>