import { fileURLToPath } from 'node:url'
import { loadNuxt } from '@nuxt/kit'
import type { Component, NuxtConfig } from '@nuxt/schema'
import * as coreThemes from '@vectorchi/fun-loader/themes/index'
import { describe, expect, it } from 'vitest'
import FunLoaderModule, { THEMES } from '../src/module'

const rootDir = fileURLToPath(new URL('./fixtures/baseline', import.meta.url))

// Loads Nuxt with the module, without building, and returns what the module set up.
async function setupModule(overrides: NuxtConfig = {}) {
  const nuxt = await loadNuxt({ cwd: rootDir, dev: false, overrides: { ...overrides, modules: [FunLoaderModule] } })
  try {
    const components: Component[] = []
    await nuxt.callHook('components:extend', components)
    const template = nuxt.options.build.templates.find(t => t.filename === 'fun-loader.mjs')
    const plugin = String(await template?.getContents?.({ nuxt, app: {}, options: {} } as never))
    const defaults = JSON.parse(plugin.match(/const defaults = (.*)/)![1]!)
    return { components, plugin, defaults, isCustomElement: nuxt.options.vue.compilerOptions.isCustomElement! }
  }
  finally {
    await nuxt.close()
  }
}

const imported = (plugin: string) => [...plugin.matchAll(/^import \{ (\w+) \} from .*\/themes\//gm)].map(m => m[1])

describe('module setup', () => {
  it('lists the same themes as the core package', () => {
    expect([...THEMES].sort()).toEqual(Object.values(coreThemes).map(t => t.name).sort())
  })

  it('registers every theme by default', async () => {
    const { plugin, defaults } = await setupModule()
    expect(imported(plugin).sort()).toEqual([...THEMES].sort())
    expect(plugin).toContain('define()')
    expect(defaults).toEqual({})
  })

  it('registers only the listed themes', async () => {
    const { plugin } = await setupModule({ funLoader: { themes: ['dev', 'calm', 'dev'] } })
    expect(imported(plugin)).toEqual(['dev', 'calm'])
    expect(plugin).toContain('registerTheme(dev)')
    expect(plugin).not.toContain('registerTheme(thinking)')
  })

  it('uses the first listed theme when thinking is left out and no default is set', async () => {
    expect((await setupModule({ funLoader: { themes: ['kitchen', 'art'] } })).defaults).toEqual({ theme: 'kitchen' })
    expect((await setupModule({ funLoader: { themes: ['art', 'thinking'] } })).defaults).toEqual({})
  })

  it('passes defaults through, merged with the module defaults', async () => {
    const { defaults } = await setupModule({ funLoader: { defaults: { theme: 'calm', icon: 'orbit', interval: 3000, label: 'Saving' } } })
    expect(defaults).toEqual({ theme: 'calm', icon: 'orbit', interval: 3000, label: 'Saving' })
  })

  it('registers the component as FunLoader, or with a custom prefix', async () => {
    const ours = (components: Component[]) => components.filter(c => c.filePath.includes('FunLoader')).map(c => c.pascalName)
    expect(ours((await setupModule()).components)).toEqual(['FunLoader'])
    expect(ours((await setupModule({ funLoader: { prefix: 'Busy' } })).components)).toEqual(['BusyLoader'])
  })

  it('marks fun-loader as a custom element', async () => {
    const { isCustomElement } = await setupModule()
    expect(isCustomElement('fun-loader')).toBe(true)
    expect(isCustomElement('fun-loaders')).toBe(false)
  })

  it('keeps an isCustomElement function the app already set', async () => {
    const { isCustomElement } = await setupModule({ vue: { compilerOptions: { isCustomElement: tag => tag.startsWith('ion-') } } })
    expect(isCustomElement('ion-button')).toBe(true)
    expect(isCustomElement('fun-loader')).toBe(true)
    expect(isCustomElement('div')).toBe(false)
  })

  // Last on purpose: on Nuxt 4.0, a load that throws stays the current Nuxt context, and
  // loads after it would set up the wrong instance.
  it('rejects unknown theme names', async () => {
    // @ts-expect-error: not a bundled theme
    await expect(setupModule({ funLoader: { themes: ['thinkng'] } })).rejects.toThrow(/Unknown theme "thinkng"/)
    await expect(setupModule({ funLoader: { themes: [] } })).rejects.toThrow(/non-empty list/)
  })
})
