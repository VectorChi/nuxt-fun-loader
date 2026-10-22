import { addComponent, addPluginTemplate, createResolver, defineNuxtModule, resolveModule, useLogger } from '@nuxt/kit'
import type { FunLoaderDefaults as RuntimeDefaults } from './runtime/app/defaults'

/** The themes bundled with `@vectorchi/fun-loader`. A test keeps this list in step with the core package. */
export const THEMES = ['thinking', 'dev', 'design', 'art', 'calm', 'finance', 'kitchen', 'transfer'] as const

export type FunLoaderThemeName = typeof THEMES[number]

export interface FunLoaderDefaults extends RuntimeDefaults {
  /** A bundled theme, or the name of a theme you register yourself. */
  theme?: FunLoaderThemeName | (string & {})
}

export interface ModuleOptions {
  /** Which themes ship to the browser. Default: `'all'`. */
  themes: 'all' | FunLoaderThemeName[]
  /** Props applied to every `<FunLoader>`. Props set on a single loader win. */
  defaults: FunLoaderDefaults
  /** The component is named `<prefix>Loader`. Default: `'Fun'`, so `<FunLoader>`. */
  prefix: string
}

const TAG = 'fun-loader'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@vectorchi/nuxt-fun-loader',
    configKey: 'funLoader',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    themes: 'all',
    defaults: {},
    prefix: 'Fun',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const logger = useLogger('fun-loader')

    const themes = resolveThemes(options.themes)
    const defaults = { ...options.defaults }
    // The element's own default is thinking; without it in the build, use the first listed theme.
    if (!defaults.theme && !themes.includes('thinking')) defaults.theme = themes[0]
    if (defaults.theme && !(THEMES as readonly string[]).includes(defaults.theme)) {
      logger.info(`Default theme "${defaults.theme}" is not bundled. Register it with registerTheme() from @vectorchi/fun-loader/element.`)
    }
    else if (defaults.theme && !themes.includes(defaults.theme as FunLoaderThemeName)) {
      logger.warn(`Default theme "${defaults.theme}" is left out by funLoader.themes, so loaders will show only "Thinking…".`)
    }

    // Vue only takes a function here, so wrap the user's instead of replacing it.
    const compilerOptions = (nuxt.options.vue.compilerOptions ||= {})
    const previous = compilerOptions.isCustomElement
    compilerOptions.isCustomElement = tag => tag === TAG || !!previous?.(tag)

    // Resolved here so the generated plugin works under strict installs (pnpm) too.
    const url = new URL(import.meta.url)
    const element = resolveModule('@vectorchi/fun-loader/element', { url })
    const imports = themes.map(name => `import { ${name} } from ${JSON.stringify(resolveModule(`@vectorchi/fun-loader/themes/${name}`, { url }))}`)

    addPluginTemplate({
      filename: 'fun-loader.mjs',
      getContents: () => [
        `import { defineNuxtPlugin } from '#app'`,
        `import { define, registerTheme } from ${JSON.stringify(element)}`,
        ...imports,
        `import { DEFAULTS_KEY } from ${JSON.stringify(resolver.resolve('./runtime/app/defaults'))}`,
        '',
        // At module level, so the element is ready before any component mounts.
        ...themes.map(name => `registerTheme(${name})`),
        'define()',
        '',
        `const defaults = ${JSON.stringify(defaults)}`,
        '',
        `export default defineNuxtPlugin({`,
        `  name: 'fun-loader',`,
        `  setup(nuxtApp) {`,
        `    nuxtApp.vueApp.provide(DEFAULTS_KEY, defaults)`,
        `  },`,
        `})`,
        '',
      ].join('\n'),
    })

    addComponent({
      name: `${options.prefix}Loader`,
      filePath: resolver.resolve('./runtime/app/components/FunLoader'),
    })
  },
})

function resolveThemes(option: ModuleOptions['themes']): FunLoaderThemeName[] {
  if (option === 'all') return [...THEMES]
  if (!Array.isArray(option) || option.length === 0) {
    throw new Error(`[fun-loader] funLoader.themes must be 'all' or a non-empty list of: ${THEMES.join(', ')}`)
  }
  const unknown = option.filter(name => !(THEMES as readonly string[]).includes(name))
  if (unknown.length) {
    throw new Error(`[fun-loader] Unknown theme ${unknown.map(n => `"${n}"`).join(', ')} in funLoader.themes. Choose from: ${THEMES.join(', ')}`)
  }
  return [...new Set(option)]
}
