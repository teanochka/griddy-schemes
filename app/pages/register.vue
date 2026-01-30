<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const email = ref('')
const nickname = ref('') 
const password = ref('')
const errorMsg = ref('')

const { register, login } = useAuth()
const router = useRouter()

const handleRegister = async () => {
  errorMsg.value = ''
  
  if (!email.value || !nickname.value || !password.value) {
    errorMsg.value = 'Заполните все поля'
    return
  }

  const result = await register(email.value, nickname.value, password.value)
  
  if (result.success) {
    await login(email.value, password.value)
    router.push('/') 
  } else {
    errorMsg.value = `Ошибка: ${result.error}`
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-96">
      <h1 class="text-2xl mb-6 font-bold text-center text-gray-800">Регистрация</h1>
      
      <div v-if="errorMsg" class="bg-red-100 text-red-700 p-3 mb-4 rounded text-sm border border-red-200">
        {{ errorMsg }}
      </div>

      <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
      <input v-model="email" type="email" class="border p-2 mb-3 w-full rounded" />

      <label class="block text-sm font-medium text-gray-700 mb-1">Никнейм</label>
      <input v-model="nickname" type="text" class="border p-2 mb-3 w-full rounded" />

      <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
      <input v-model="password" type="password" class="border p-2 mb-6 w-full rounded" />

      <button @click="handleRegister" class="bg-green-600 text-white font-bold py-2 w-full rounded">
        Создать аккаунт
      </button>

      <div class="mt-4 text-center text-sm">
        <NuxtLink to="/login" class="text-blue-500">Войти</NuxtLink>
      </div>
    </div>
  </div>
</template>