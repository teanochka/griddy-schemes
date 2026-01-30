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

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded shadow-md w-80">
      <h1 class="text-xl mb-4 font-bold">Вход</h1>
      <input v-model="email" placeholder="Email" class="border p-2 mb-2 w-full" />
      <input v-model="password" type="password" placeholder="Пароль" class="border p-2 mb-4 w-full" />
      <button @click="handleLogin" class="bg-blue-500 text-white p-2 w-full rounded">Войти</button>
      <div class="mt-4 text-center text-sm">
        Нет аккаунта? 
        <NuxtLink to="/register" class="text-blue-500 hover:underline">Зарегистрироваться</NuxtLink>
      </div>

    </div>
  </div>
</template>