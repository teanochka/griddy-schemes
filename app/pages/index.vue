<script setup>
import { onMounted, ref } from 'vue'
import { useApi } from '@/composables/useApi'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { getProjects, createProject } = useApi()
const { user, logout } = useAuth()
const router = useRouter()

const projects = ref([])
const newProjectTitle = ref('')
const isLoading = ref(true)

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const loadProjects = async () => {
  try {
    projects.value = await getProjects()
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  if (!user.value) return router.push('/login')
  loadProjects()
})

const handleCreate = async () => {
  if (!newProjectTitle.value.trim()) return
  
  try {
    const newProj = await createProject(newProjectTitle.value)
    
    projects.value.unshift(newProj)
    newProjectTitle.value = ''
  } catch (e) {
    alert("Ошибка создания проекта")
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="flex justify-between items-center mb-8 bg-white p-4 rounded shadow-sm">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
          {{ user?.nickname?.charAt(0).toUpperCase() }}
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-800">{{ user?.nickname }}</h1>
          <p class="text-xs text-gray-500">{{ user?.email }}</p>
        </div>
      </div>
      <button @click="logout" class="text-red-500 hover:bg-red-50 px-4 py-2 rounded transition">
        Выйти
      </button>
    </div>

    <div class="mb-8 flex gap-3 max-w-2xl mx-auto">
      <input 
        v-model="newProjectTitle" 
        placeholder="Название нового проекта..." 
        class="flex-1 border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
        @keyup.enter="handleCreate"
      />
      <button 
        @click="handleCreate" 
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow-sm transition"
      >
        Создать +
      </button>
    </div>

    <div v-if="isLoading" class="text-center text-gray-500 mt-10">Загрузка проектов...</div>

    <div v-else-if="projects.length === 0" class="text-center text-gray-400 mt-10">
      У вас пока нет проектов. Создайте первый!
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink 
        v-for="p in projects" 
        :key="p.id" 
        :to="`/workspace/${p.id}`"
        class="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition duration-200 group"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition">{{ p.title }}</h3>
          <span class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">#{{ p.id }}</span>
        </div>
        
        <div class="text-sm text-gray-600 space-y-2">
          <p class="flex items-center gap-2">
            <span class="text-gray-400">Создал:</span> 
            <span class="font-medium text-black">{{ p.owner.nickname }}</span>
            <span v-if="p.owner.id === user.id" class="text-xs bg-blue-100 text-blue-700 px-1.5 rounded">Вы</span>
          </p>
          
          <p class="flex items-center gap-2">
            <span class="text-gray-400">Дата:</span> 
            <span>{{ formatDate(p.created_at) }}</span>
          </p>

          <div class="mt-4 pt-3 border-t border-gray-100">
            <p class="text-xs text-gray-400 mb-1">Доступ имеют:</p>
            <div class="flex flex-wrap gap-1">
              <span 
                v-for="u in p.allowed_users" 
                :key="u.id"
                class="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700 border"
              >
                {{ u.nickname }}
              </span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>