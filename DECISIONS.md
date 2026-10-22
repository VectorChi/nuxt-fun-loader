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

## No client-only wrapper

The core element already loads on the server (it extends a plain class when `HTMLElement` is missing, and `define` skips without `customElements`). `test/ssr.test.ts` builds a fixture and checks that the page returns 200, that the server HTML carries the right attributes, and that the page hydrates in Chromium with no console warnings or errors. Messages also rotate, arrays reach the element as properties, and booleans switch on and off. So `<FunLoader>` renders on the server like any component: the tag and its attributes are in the HTML, and the shadow DOM fills in when the script runs.

The hydration check was tested by planting a mismatch (`import.meta.server` in the template): the test failed with Vue's "Hydration text content mismatch" warning. The fixture turns on `__VUE_PROD_HYDRATION_MISMATCH_DETAILS__` so production builds report details.

## Booleans are only passed when true

The first SSR run rendered `paused="false" iconOnly="false" ordered="false"`. Vue's server renderer writes `false` as text for attributes it does not know, and the element treats any `paused` or `ordered` attribute as on, so every server-rendered loader started paused and ordered until hydration. The component now passes `paused`, `icon-only` and `ordered` only when true (`|| undefined`), using the element's attribute name `icon-only`. On the client Vue sets them as properties, so switching back to false works; the SSR test covers both directions.

The core `/vue` component had the same bug, fixed in core 0.5.1 (CORE-REQUESTS.md, item 0).

## Tree-shaking test and size

`test/themes.test.ts` builds the `themes` fixture twice with `buildNuxt` and reads the client JavaScript. With `themes: ['thinking']`, one plain line from each of the seven other themes must be missing; with `'all'`, all seven must be present. Lines are compared without the trailing ellipsis, because the minifier may escape it.

`npm run size` builds the same app with and without the module and reports the difference. Each build starts from empty folders, because leftover chunks from an earlier build were being counted twice. Measured on 2026-10-22 with core 0.5.0 and Nuxt 4.6.2:

| Config | Minified | Gzip | Brotli |
| --- | --- | --- | --- |
| `themes: ['thinking']` | 8.62 kB | 2.76 kB | 2.54 kB |
| `themes: 'all'` | 12.51 kB | 4.29 kB | 3.90 kB |

These are differences of whole compressed builds, so they are close to, not exactly, what the loader's own code compresses to. They fit the core's own figures (2.3 kB for the element, 4.4 kB with all themes, brotli).

## Browser for the E2E test

`@nuxt/test-utils` drives Playwright. CI installs Playwright's Chromium. Locally, `CHROMIUM_PATH` can point at any installed Chromium-based browser, so nobody has to download one just to run the tests.

## CI on Nuxt 4.0 and the newest 4.x

The matrix installs `nuxt@4.0` or `nuxt@4` over the lockfile (`npm install --no-save`) and runs prepare, lint, typecheck, tests (including the E2E test in Playwright's Chromium) and the module build. `@nuxt/kit` stays at the version in the lockfile, as it would in a user's app: the guide asks modules to use the latest Kit, which supports older Nuxt versions.

Running the 4.0 leg locally before CI turned up three things:

- The playground pinned its own `nuxt ^4.6.2`, so the matrix ran two Nuxt versions at once and `nuxt prepare playground` failed. The playground now uses the root's Nuxt.
- On Nuxt 4.0, a `loadNuxt` that throws stays the current Nuxt context, so the setup tests that ran after the "rejects unknown theme names" case set up the wrong instance. That case now runs last. A real build stops at the error, so apps are not affected.
- `scripts/size.ts` imports `../test/build.ts`, which Node's type stripping needs and TypeScript allows only with `allowImportingTsExtensions`. Nuxt 4.6's generated tsconfig turns it on; 4.0's does not, so the root tsconfig sets it.

With those fixed, every step passes on Nuxt 4.0.3 and 4.6.2, including the playground build.

## Release workflow

`.github/workflows/release.yml` runs on a `v*` tag, the same way as the core's: it checks that the tag matches `package.json`, runs every check, then `npm stage publish` with OIDC trusted publishing. A staged version goes live only after a maintainer approves it with 2FA on npmjs.com. Provenance is set in `publishConfig`, and `repository` matches the GitHub repo, which provenance requires. The workflow is not triggered by anything in this repo until a tag is pushed.

## Install check: `nuxi module add`

Tried on 2026-10-22 in a fresh app from `nuxi init --template minimal` (Nuxt 4.6.2): `npx nuxi module add @vectorchi/nuxt-fun-loader` stops with "Failed to fetch package details for @vectorchi/nuxt-fun-loader. Request to registry.npmjs.org failed with status 404." That is expected: the command reads the package from npm, and nothing is published yet. There is nothing to fix in the module. Run it again after the first publish.

What the command would do, installing the package and adding it to `modules`, was checked by hand with the packed tarball (`npm pack`):

- **npm:** the fresh app builds, and the server renders `<fun-loader theme="kitchen">` with `funLoader.themes: ['kitchen']` (the first listed theme became the default).
- **pnpm 9 (strict layout):** the same app builds and renders the same HTML. The core package is not hoisted to the app's `node_modules`, so this confirms the plugin's resolved import paths are needed and work.

The tarball holds 11 files: `dist`, `package.json`, `README.md` and `LICENSE`.

## Description

The nuxt/modules README asks that a module's description not mention Nuxt or its versions, and `pnpm sync` copies the description from `package.json`. So the `package.json` description leaves Nuxt out, and `nuxt` and `nuxt-module` are in `keywords` for npm search.

## First publish by hand; later ones from CI

v0.1.0 was published from a laptop with `npm publish --provenance=false` on 2026-10-22, because trusted publishing can only be set up once a package exists. So 0.1.0 has no provenance. The release workflow now skips the publish step when the tagged version is already on npm. That only helps tags on commits that contain the new step: 0.1.0 was published from `2ccb009`, whose workflow does not have it, so a `v0.1.0` tag there would fail at the publish step (harmlessly, since npm refuses to overwrite a version).
