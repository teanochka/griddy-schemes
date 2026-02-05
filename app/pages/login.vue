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
        <p class="text-xl text-gray-600 text-center">Вход</p>

        <form @submit.prevent="handleSubmit">
          <div class="mt-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              v-model="email"
              required
              class="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
            />
          </div>

          <div class="mt-4">
            <div class="flex justify-between">
              <label class="block text-gray-700 text-sm font-bold mb-2">Пароль</label>
            </div>
            <input
              type="password"
              v-model="password"
              required
              class="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none"
            />
          </div>

          <div class="mt-8">
            <button
              @click="handleLogin"
              class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
            >
            Войти
            </button>
          </div>
        </form>

        <div class="mt-4 flex items-center justify-between">
          <span class="border-b w-1/5 md:w-1/4"></span>
          <NuxtLink to="/register" class="text-xs text-gray-500 hover:text-gray-700">
            Нет аккаунта? Зарегистрироваться
          </NuxtLink>
          <span class="border-b w-1/5 md:w-1/4"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const email = ref('')
const password = ref('')
const { login } = useAuth()
const router = useRouter()

const handleLogin = async () => {
  const success = await login(email.value, password.value)
  if (success) {
    router.push('/')
  } else {
    alert('Ошибка входа')
  }
}
</script>