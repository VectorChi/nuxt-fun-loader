# Research

Notes from reading the Nuxt docs and the core package before writing code. Read on 2026-10-22, against Nuxt 4.6.2, `@nuxt/kit` 4.6.2, `@nuxt/module-builder` 1.0.3 and `@vectorchi/fun-loader` 0.5.0.

## Sources

- Module Author Guide, all sub pages: <https://nuxt.com/docs/4.x/guide/modules> (getting started, module anatomy, recipes basics, module dependencies, recipes advanced, testing, best practices, ecosystem)
- Nuxt Kit: modules, components, auto-imports, plugins, resolving, templates, compatibility (<https://nuxt.com/docs/4.x/api/kit>)
- Nuxt roadmap and release table: <https://nuxt.com/docs/4.x/community/roadmap>
- nuxt/modules README: <https://github.com/nuxt/modules#readme>
- The installed core package: `node_modules/@vectorchi/fun-loader` (package.json, `dist/`)

## What the guide says

- **Start from the starter.** `npx nuxi init -t module <name>` (the 4.x page now shows `npm create nuxt -- -t module <name>`; both fetch the same template). It gives `src/module.ts`, `src/runtime/`, a `playground/` app, Vitest with one E2E test, ESLint with `@nuxt/eslint-config`, and `@nuxt/module-builder` for the build.
- **Use `defineNuxtModule` with `meta`.** `meta.name` is usually the npm name, `meta.configKey` is the `nuxt.config` key, and `meta.compatibility.nuxt` is a semver range that Nuxt checks on startup. `defaults` merges with user options.
- **Runtime code lives in `src/runtime/`,** and app code (components, composables) in `src/runtime/app/` so it is type checked in the app context. Published modules get no auto-imports inside their own runtime files, so they import from `#imports` or `#app`.
- **Components:** `addComponent({ name, export, filePath, mode, priority, ... })` registers one auto-imported component, from the runtime directory or from a package. `mode: 'client'` makes it client only.
- **Plugins:** `addPlugin(path)` or `addPlugin({ src, mode })`. Templates: `addTemplate({ filename, getContents })` writes a virtual file importable from `#build/<filename>`. `addPluginTemplate` does both in one step.
- **Options at runtime:** the guide recommends `runtimeConfig.public` merged with `defu`, for options that runtime code needs. Anything there ends up in the public bundle and the HTML payload.
- **Types:** module options are typed through the `ModuleOptions` interface; the module builder generates the `NuxtConfig` augmentation from it. `addTypeTemplate` and the `prepare:types` hook add more declarations.
- **Testing:** E2E with `@nuxt/test-utils/e2e` and fixtures in `test/fixtures/*`. Unit testing of modules is "still being discussed" (an open RFC), so there is no official helper for setup tests.
- **Best practices:** prefix components (`<FooButton>`), keep setup fast (warns past 1 second), stay version agnostic ("X for Nuxt", not "X for Nuxt 3") and use `meta.compatibility`, document why, how and what, and offer a StackBlitz demo.
- **Naming and listing:** official modules are `@nuxt/`, community modules under the nuxt-modules org are `@nuxtjs/`, third-party ones are often `nuxt-`, and "private or personal modules ... are often seen scoped under an npm organization (e.g. `@my-company/nuxt-auth`)". To be listed, open a **pull request** to nuxt/modules. An issue there is only for asking to move a module into the nuxt-modules org.
- **nuxt/modules README:** fork, `pnpm install`, `pnpm sync <name> <repo>` to generate `modules/<name>.yml` from the package.json, set `category` from `lib/categories.ts`, optionally add an icon, open the PR. The `description` must not mention Nuxt or Nuxt versions. Fields: name, description, repo, npm, icon, github, website, learn_more, category, type (`community`, `official`, `3rd-party`), maintainers, compatibility.

## What the core package does

- Exports: `.` (defines the element and registers every theme), `/element` (the class, `define`, `registerTheme`, defaults, no copy), `/themes/*` (one theme object per file, not registered), `/vue`, `/react`, `/custom-elements.json`.
- Themes do **not** register themselves. `dist/themes/thinking.js` only exports a `{ name, messages, stages }` object. Registration is `registerTheme(theme)`, and `define(tag)` registers the element.
- `/vue` calls `defineAll()` at import time, which imports `./themes` and registers all eight. `sideEffects` in the core package.json lists `dist/vue/index.js`, so a bundler keeps all of it.
- The element is SSR safe: it extends `class {}` when `HTMLElement` is undefined, and `define` skips when `customElements` is undefined.
- Defaults (`DEFAULT_THEME = 'thinking'`, `DEFAULT_ICON = 'spinner'`, `DEFAULT_INTERVAL = 2400`) are constants. There is no API to change them app wide.
- A theme that is not registered falls back to a single `Thinking…` message (`FALLBACK` in `element.ts`). So a page asking for a theme that was left out of the build still shows something, but not that theme's copy. See DECISIONS.md, "Themes left out of the build".

## Assumptions

### A: the starter layout works unchanged for a standalone module

**True, with two small fixes.** `npm install`, `npm run dev:prepare` and `npm test` pass on the untouched starter. Two things needed attention:

- `npm run lint` fails on the starter itself: the empty `ModuleOptions` interface trips `@typescript-eslint/no-empty-object-type`. It goes away once the interface has fields.
- npm 12 blocks install scripts by default, so the `esbuild` and `unrs-resolver` postinstall steps do not run. Both still work, because their platform binaries come from optional dependencies; the postinstall only verifies them. Nothing to change.

The starter also ships a `release` script that publishes from the laptop with `npm publish`. That is replaced by a tag-triggered workflow (see DECISIONS.md).

### B: only the chosen themes ship to the client

**True for the element, false for `/vue`.** Registering themes one by one from `/element` and `/themes/<name>` works. But the prompt's plan to use the `/vue` component would bundle every theme anyway, because `/vue` registers all of them on import.

What I do instead: the module ships its own small Vue component (the same props as `/vue`, written against `/element`) and a generated plugin that imports and registers only the listed themes. The core change that would let the module reuse `/vue` is in CORE-REQUESTS.md.

### C: add the tag to `vue.compilerOptions.isCustomElement` without overwriting the user's setting

**True.** Vue only accepts a function here (`(tag: string) => boolean`), not a list, so "a list the user already set" does not apply. The module wraps any existing function: `tag => tag === 'fun-loader' || previous(tag)`. A setup test covers both cases.

### D: which Nuxt majors to support

**The previous major is out.** The roadmap says "Nuxt 3 reached end of life on 31 July 2026 and no longer receives bug fixes or security patches." Nuxt 4 is the stable line and Nuxt 5 is scheduled for Q4 2026. So `meta.compatibility.nuxt` is `>=4.0.0`, and CI tests the oldest and newest 4.x. Nuxt 5 is not excluded, because the guide asks modules to stay version agnostic.

### E: module options versus `runtimeConfig.public`

**Only `defaults` is needed at runtime, and a build template fits it better.** `themes` and `prefix` are build-time choices: they decide what gets imported and what the component is called. `defaults` must reach the browser. The guide's suggestion, `runtimeConfig.public`, would also make them overridable by environment variables, which nobody needs for a loader's theme. It would also put them in every page's payload. A generated `#build/fun-loader.mjs` template bakes them into the bundle instead. Both approaches are typed; the template is smaller and needs no `defu` dependency.
