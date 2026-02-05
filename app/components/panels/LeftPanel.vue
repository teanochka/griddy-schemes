<template>
  <div class="w-64 bg-slate-50 border-r border-gray-300 h-full flex flex-col overflow-hidden">
    <div class="font-black text-slate-800 text-xl py-4 px-4 shrink-0">Компоненты</div>

    <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
      <section v-for="cat in componentRegistry.categories" :key="cat.id" class="space-y-2">
        <button
          type="button"
          class="w-full flex items-center justify-between gap-2 py-2 text-left font-semibold text-gray-700 hover:bg-slate-200/60 rounded-lg px-2 -mx-2 transition-colors"
          @click="toggleCategory(cat.id)"
        >
          <span>{{ cat.name }}</span>
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512.000000 512.000000"
            preserveAspectRatio="xMidYMid meet"
            class="w-3 h-3 text-gray-400 shrink-0 transition-transform duration-200"
            :class="{ '-rotate-90': collapsed[cat.id] ?? false }"
            aria-hidden="true"
          >
            <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none">
              <path d="M415 4146 c-69 -30 -111 -124 -85 -190 11 -30 2062 -2877 2109 -2929 36 -40 73 -57 121 -57 48 0 85 17 121 57 60 65 2101 2905 2110 2935 21 72 -19 155 -88 184 -48 20 -4242 20 -4288 0z"/>
            </g>
          </svg>
        </button>

        <div v-show="!(collapsed[cat.id] ?? false)" class="space-y-1.5 pl-1">
          <div
            v-for="t in cat.types"
            :key="t.id"
            class="flex items-center gap-3 p-2.5 rounded-lg cursor-grab active:cursor-grabbing
                   hover:bg-slate-200/80 border border-transparent hover:border-slate-300 transition-colors"
            @mousedown.prevent="onMouseDown($event, t.id)"
          >
            <div
              class="w-10 h-10 shrink-0 rounded flex items-center justify-center text-xs font-medium shadow-sm"
              :class="{ 'border-2': !t.previewIcon }"
              :style="{ backgroundColor: t.previewIcon ? 'transparent' : (t.previewBg ?? '#e5e7eb'), borderColor: t.previewBorder ?? '#9ca3af' }"
            >
              <img
                v-if="t.previewIcon"
                :src="`/svg/${t.previewIcon}`"
                :alt="t.name"
                class="w-6 h-6"
              />
              <span v-else>{{ t.name.slice(0, 2) }}</span>
            </div>
            <span class="text-sm text-gray-800 truncate">{{ t.name }}</span>
          </div>
          <p
            v-if="cat.types.length === 0"
            class="text-xs text-gray-500 py-2 px-2"
          >
            Нет элементов
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { componentRegistry } from '@/data/componentRegistry'
import { startDrag, updateDrag, endDrag } from '@/composables/useDrag'

const collapsed = reactive<Record<string, boolean>>({})

function toggleCategory(id: string) {
  collapsed[id] = !(collapsed[id] ?? false)
}

function onMouseDown(e: MouseEvent, typeId: string) {
  startDrag(typeId, e, 'sidebar')
  window.addEventListener('mousemove', updateDrag)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseUp() {
  endDrag()
  window.removeEventListener('mousemove', updateDrag)
  window.removeEventListener('mouseup', onMouseUp)
}
</script>
