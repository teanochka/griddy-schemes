import vue3GoogleLogin from 'vue3-google-login'

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    if (config.public.googleClientId) {
        nuxtApp.vueApp.use(vue3GoogleLogin, {
            clientId: config.public.googleClientId as string
        })
    } else {
        console.warn("Google Client ID is missing. Google Sign-In will not work.")
    }
})
