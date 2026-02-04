export const useAuth = () => {
    const token = useCookie('auth_token')
    const user = useState('auth_user', () => null)

    const login = async (email, password) => {
        const formData = new FormData()
        formData.append('username', email)
        formData.append('password', password)

        try {
            const data = await $fetch('/api/token', {
                method: 'POST',
                body: formData
            })
            token.value = data.access_token
            user.value = { id: data.user_id, nickname: data.nickname }
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }

    const register = async (email, nickname, password) => {
        try {
            await $fetch('/api/register', {
                method: 'POST',
                body: { email, nickname, password }
            })
            return { success: true, error: null }
        } catch (e: any) {
            console.error("Ошибка регистрации:", e)
            const msg = e.response?._data?.detail || e.message || "Неизвестная ошибка"
            return { success: false, error: msg }
        }
    }

    const googleLogin = async (googleToken: string) => {
        try {
            const data = await $fetch('/api/google-login', {
                method: 'POST',
                body: { token: googleToken }
            })
            token.value = data.access_token
            user.value = { id: data.user_id, nickname: data.nickname }
            return true
        } catch (e) {
            console.error("Google Login Error:", e)
            return false
        }
    }

    const logout = () => {
        token.value = null
        user.value = null
        navigateTo('/login')
    }

    return { token, user, login, register, googleLogin, logout }
}