# Decisions

Non-obvious choices and why. RESEARCH.md has the sources.

## Name: `@vectorchi/nuxt-fun-loader`

- Checked on 2026-10-22: the registry returns 404 for `@vectorchi/nuxt-fun-loader`, so the name is free. The `@vectorchi` scope is the one the core package uses, and its only maintainer is `vectorchi`, so the same account can publish here.
- Scoped packages publish as private by default, so `publishConfig.access` is `public`. `publishConfig.provenance` is on, and `repository` points at `github.com/VectorChi/nuxt-fun-loader`, which provenance needs to match the workflow.
- The guide's ecosystem page calls scoped names the usual shape for "private or personal modules" (its example is `@my-company/nuxt-auth`). Community modules in the list are usually `nuxt-*` or `@nuxtjs/*`. LISTING.md asks the Nuxt team directly whether a scoped community module can be listed.

## Nuxt 4 only

Nuxt 3 reached end of life on 31 July 2026 (Nuxt roadmap). `meta.compatibility.nuxt` is `>=4.0.0`, with no upper bound, so Nuxt 5 is not blocked before anyone has tried it.

## Starter changes

- The starter's `release` script publishes from a laptop with `npm publish`. Publishing happens in CI on a version tag instead, with provenance, so the script is removed.
- npm 12 blocks the `esbuild` and `unrs-resolver` postinstall scripts. They only verify binaries that optional dependencies already installed, so nothing is approved or changed.

## Own Vue component instead of `@vectorchi/fun-loader/vue`

`/vue` calls `defineAll()` when imported, which registers all eight themes, and the core marks that file as having side effects. Using it would make `funLoader.themes` do nothing. So `src/runtime/app/components/FunLoader.ts` is a copy of the `/vue` component (about 30 lines, same props) built on `/element`. CORE-REQUESTS.md asks core for an export that would let the module drop this copy.

The deprecated `shuffle` prop from `/vue` is left out. It exists for code written before core 0.4.0, and no Nuxt app has used this module yet.

## Themes are registered by a generated plugin

`addPluginTemplate` writes `fun-loader.mjs` with one import per chosen theme from `@vectorchi/fun-loader/themes/<name>`, then `registerTheme(...)` and `define()` at module level. Module level, not inside the plugin's `setup`, because themes have to exist before the first loader renders, and that also covers the raw `<fun-loader>` tag in apps that never use `<FunLoader>`.

Import paths are resolved to absolute files with `resolveModule` at build time. The template lives in the app's `.nuxt` folder, and under pnpm's strict layout the app cannot resolve the module's own dependency by name.

Theme names are a hard-coded list (`THEMES`), so the option has a literal type. A test compares it with the themes the core package exports, so a core release that adds a theme fails the test until the list is updated.

## Themes left out of the build

The element's built-in default theme is `thinking`. If `funLoader.themes` leaves it out and `defaults.theme` is unset, the module sets `defaults.theme` to the first listed theme. Otherwise every `<FunLoader>` without a `theme` would show the element's fallback, a single "Thinking…".

Unknown names in `funLoader.themes` and an empty list stop the build with the list of valid names. A `defaults.theme` that is a bundled theme but left out of the build only warns, because the build still works. A `defaults.theme` that is not a bundled theme at all is allowed, with a note, since apps can register their own themes.

## Defaults are provided by the plugin, not `runtimeConfig`

`funLoader.defaults` is written into the plugin as a literal and provided with `vueApp.provide`; `<FunLoader>` injects it and spreads its own set props on top. The guide suggests `runtimeConfig.public` for options needed at runtime, but these values are fixed at build time, and runtime config would add them to every page's payload and make them overridable by environment variables, which a loader's theme does not need.

They do not reach the raw `<fun-loader>` tag. The element's defaults are constants in core, and the only alternatives were patching every element from the outside (a MutationObserver) or depending on core's private members. CORE-REQUESTS.md asks for an API.

## `isCustomElement`

Vue's `compilerOptions.isCustomElement` is a function, not a list. The module wraps whatever function the app already set: `tag => tag === 'fun-loader' || previous(tag)`. Only the exact tag matches, not a `fun-` prefix, so it never claims tags from other libraries.

## `prefix`

`addComponent` takes any name, so `prefix` costs one line: the component is registered as `${prefix}Loader`. Kept, as the prompt asked. The default `Fun` gives `<FunLoader>`, the same name as the core's Vue component, so examples from the core docs work unchanged.

## Setup tests use `loadNuxt`

The guide says unit testing modules is still an open RFC and offers no helper. `test/module.test.ts` loads Nuxt with the module through `loadNuxt` (no build), reads the generated plugin's contents, calls `components:extend` to see the registered component, and checks `isCustomElement`. Each case takes well under a second.
