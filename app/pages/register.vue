<template>
  <div class="py-16">
    <div class="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
      <div
        class="hidden lg:block lg:w-1/2 bg-cover"
        :style="{
          backgroundImage: 'url(/pattern.png)',
        }"
      />
      <div class="w-full p-8 lg:w-1/2">
        <h2 class="text-2xl font-semibold text-gray-700 text-center mb-2">Регистрация</h2>

        <form @submit.prevent="handleSubmit">
          <div v-if="errors.submit" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {{ errors.submit }}
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Никнейм</label>
            <input
              type="text"
              v-model="nickname"
              placeholder="Никнейм"
              :class="['w-full px-3 py-2 text-sm border rounded focus:outline-none focus:shadow-outline', 
                       errors.nickname ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.nickname" class="text-xs italic text-red-500 mt-1">
              {{ errors.nickname }}
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              v-model="email"
              placeholder="Email"
              :class="['w-full px-3 py-2 text-sm border rounded focus:outline-none focus:shadow-outline', 
                       errors.email ? 'border-red-500' : 'border-gray-300']"
            />
            <p v-if="errors.email" class="text-xs italic text-red-500 mt-1">
              {{ errors.email }}
            </p>
          </div>

          <div class="flex gap-4 mb-6">
            <div class="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2">Пароль</label>
              <input
                type="password"
                v-model="password"
                placeholder="••••••••"
                :class="['w-full px-3 py-2 text-sm border rounded focus:outline-none focus:shadow-outline', 
                         errors.password ? 'border-red-500' : 'border-gray-300']"
              />
              <p v-if="errors.password" class="text-xs italic text-red-500 mt-1">
                {{ errors.password }}
              </p>
            </div>
            <div class="flex-1">
              <label class="block text-gray-700 text-sm font-bold mb-2">Подтвердите пароль</label>
              <input
                type="password"
                v-model="confirmPassword"
                placeholder="••••••••"
                :class="['w-full px-3 py-2 text-sm border rounded focus:outline-none focus:shadow-outline', 
                         errors.confirmPassword ? 'border-red-500' : 'border-gray-300']"
              />
              <p v-if="errors.confirmPassword" class="text-xs italic text-red-500 mt-1">
                {{ errors.confirmPassword }}
              </p>
            </div>
          </div>

          <div class="mb-6">
            <button
              type="submit"
              :disabled="loading"
              :class="['w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200']"
            >
              {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
            </button>
          </div>

          <hr class="mb-4 border-gray-300" />

          <div class="text-center mb-3">
          </div>

          <div class="text-center">
            <NuxtLink to="/login" class="text-sm text-gray-600 hover:text-gray-800 hover:underline">
              Уже есть аккаунт? <span class="font-semibold">Войти!</span>
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from '#app'

const nickname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errors = ref({})
const router = useRouter()

const { register, login } = useAuth()

const validateForm = () => {
  const newErrors = {}

  if (!nickname.value.trim()) newErrors.nickname = 'Nickname is required'
  if (!email.value.trim()) newErrors.email = 'Email is required'
  if (!password.value) newErrors.password = 'Password is required'
  if (password.value.length < 6) newErrors.password = 'Password must be at least 6 characters'
  if (password.value !== confirmPassword.value) newErrors.confirmPassword = 'Passwords do not match'

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return

  errors.value = {}

  const result = await register(email.value, nickname.value, password.value)
  
  if (result.success) {
    await login(email.value, password.value)
    router.push('/') 
  } else {
    errors.value = `Ошибка: ${result.error}`
  }
}
</script>