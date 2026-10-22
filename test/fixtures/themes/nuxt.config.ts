import FunLoaderModule from '../../../src/module'

// The tree-shaking test builds this app with different funLoader.themes.
export default defineNuxtConfig({
  modules: [FunLoaderModule],
  compatibilityDate: 'latest',
})
