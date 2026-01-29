<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import LeftPanel from '@/components/panels/LeftPanel.vue'
import DragImage from '@/components/DragImage.vue'
import DraggableCard from '@/components/DraggableCard.vue'

import { isDragging, dragType, endDrag } from '@/composables/useDrag'
import { useCursors } from '@/composables/useCursors'
import { useAuth } from '@/composables/useAuth'
import { useApi } from '@/composables/useApi'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const { user } = useAuth()
const { inviteUser, getProjectContent } = useApi()

if (!user.value) {
  router.push('/login')
}

const cards = ref([]) 
const workspaceRef = ref(null)

const handleRemoteUpdate = (remoteCards) => {
    cards.value = remoteCards
}

const { cursors, sendCursor, sendData, connect } = useCursors(
    projectId, 
    user.value?.nickname || 'Anon',
    handleRemoteUpdate
)

const syncCards = () => {
    sendData({
        type: "update_cards",
        cards: cards.value
    })
}

function handleWorkspaceMouseMove(e) {
  if (!workspaceRef.value) return
  const rect = workspaceRef.value.getBoundingClientRect()
  sendCursor(e.clientX - rect.left, e.clientY - rect.top)
}

function handleGlobalMouseUp(e) {
  if (!isDragging.value) return
  if (!workspaceRef.value) return

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
    
    syncCards()
  }
  endDrag()
}

const onCardUpdate = (id, x, y) => {
    const c = cards.value.find(c => c.id === id)
    if (c) { 
        c.x = x; 
        c.y = y; 
        syncCards()
    }
}

const inviteInput = ref('')
const inviteStatus = ref('')
const handleInvite = async () => {
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
      if (data && data.cards) {
          cards.value = data.cards
      }
  } catch (e) {
      console.error("Ошибка загрузки проекта", e)
  }
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleGlobalMouseUp)
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <header class="h-14 bg-white border-b flex items-center justify-between px-6 z-50">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-gray-500 hover:text-black text-sm">← Назад</NuxtLink>
        <h1 class="font-bold text-gray-800">Проект #{{ projectId }}</h1>
      </div>
      <div class="flex gap-2">
        <span class="text-sm text-gray-500 self-center">{{ inviteStatus }}</span>
        <input v-model="inviteInput" placeholder="Invite user..." class="border px-2 py-1 text-sm rounded" />
        <button @click="handleInvite" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">Add</button>
      </div>
    </header>

    <div class="flex flex-1 overflow-hidden">
      <LeftPanel />
      <DragImage />

      <div
        ref="workspaceRef"
        class="workspace flex-1 relative overflow-hidden bg-slate-50"
        @mousemove="handleWorkspaceMouseMove"
      >
        <div class="absolute inset-0 opacity-10 pointer-events-none" 
             style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 20px 20px;">
        </div>

        <DraggableCard
          v-for="card in cards"
          :key="card.id"
          :card="card"
          @update:position="onCardUpdate"
        />

        <div 
          v-for="(cursor, userKey) in cursors" 
          :key="userKey"
          class="absolute pointer-events-none z-[9999] transition-all duration-100 ease-linear"
          :style="{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" :fill="cursor.color" class="drop-shadow-md">
             <path d="M5.5,2.5 L18.5,14.5 L12.5,14.5 L15.5,21.5 L12.5,22.5 L9.5,15.5 L5.5,19.5 Z" stroke="white" stroke-width="1.5"/>
          </svg>
          <span class="ml-4 -mt-3 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-80 whitespace-nowrap">
            {{ userKey }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>