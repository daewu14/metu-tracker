// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0' }
      ]
    }
  },
  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    authUsers: process.env.AUTH_USERS,
    googleCredentials: process.env.GOOGLE_CREDENTIALS,
  }
})
