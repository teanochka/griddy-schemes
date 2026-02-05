<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-gray-50">
    <div class="flex flex-col items-center justify-center text-sm max-md:px-4 text-center">
      <h1 class="text-8xl md:text-9xl font-bold text-blue-600">
        {{ error?.statusCode || 'ERR' }}
      </h1>
      
      <div class="h-1 w-16 rounded bg-blue-600 my-5 md:my-7"></div>
      
      <p class="text-2xl md:text-3xl font-bold text-gray-800">
        {{ errorTitle }}
      </p>
      
      <p class="text-sm md:text-base mt-4 text-gray-500 max-w-md text-center">
        {{ errorDescription }}
      </p>

      <!-- Dev Error Details -->
      <div v-if="isDev && error?.message" class="mt-6 mx-auto max-w-lg text-left w-full">
        <code class="block bg-red-50 text-red-600 text-xs p-4 rounded-lg overflow-x-auto border border-red-100 shadow-sm font-mono">
          {{ error.message }}
        </code>
      </div>

      <div class="flex items-center gap-4 mt-8">
        <button 
          @click="handleClearError" 
          class="bg-blue-600 hover:bg-blue-700 px-7 py-2.5 text-white rounded-md active:scale-95 transition-all shadow-sm"
        >
          На главную
        </button>
        
        <button 
          v-if="canGoBack"
          @click="router.back()" 
          class="border border-gray-300 px-7 py-2.5 text-gray-800 rounded-md active:scale-95 transition-all hover:bg-gray-50 bg-white"
        >
          Назад
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

// Props
const props = defineProps({
  error: Object as () => NuxtError
})

// Utilities
const router = useRouter()
const isDev = import.meta.dev

// State
const canGoBack = ref(false)

// Computed
const errorTitle = computed(() => {
  if (props.error?.statusCode === 404) return 'Страница не найдена'
  if (props.error?.statusCode === 500) return 'Ошибка сервера'
  return 'Ой!'
})

const errorDescription = computed(() => {
  if (props.error?.statusCode === 404) {
    return "Она была удалена или перемещена."
  }
  return "Что-то пошло не так. Попробуйте снова позже."
})

// Lifecycle
onMounted(() => {
  canGoBack.value = window.history.length > 1
})

// Methods
const handleClearError = () => {
  clearError({ redirect: '/' })
}
</script>

<style scoped>
/* Animations removed */
</style>
