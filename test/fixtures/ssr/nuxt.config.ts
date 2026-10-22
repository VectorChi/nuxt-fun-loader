import FunLoaderModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [FunLoaderModule],
  compatibilityDate: 'latest',
  // Production builds hide hydration mismatch details; turn them on so the test sees them.
  vite: { define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'true' } },
  funLoader: {
    themes: ['dev', 'calm'],
    defaults: { icon: 'orbit', label: 'Loading the page' },
  },
})
