export default defineNuxtConfig({
  modules: ['@vectorchi/nuxt-fun-loader'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  funLoader: {
    themes: 'all',
    defaults: { icon: 'orbit', label: 'Loading' },
  },
})
