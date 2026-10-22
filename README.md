# @vectorchi/nuxt-fun-loader

[![npm](https://img.shields.io/npm/v/@vectorchi/nuxt-fun-loader)](https://www.npmjs.com/package/@vectorchi/nuxt-fun-loader)
[![license](https://img.shields.io/npm/l/@vectorchi/nuxt-fun-loader)](LICENSE)

Playful, rotating loading text in Nuxt, with only the themes you use in the bundle.

This is the Nuxt module for [fun-loader](https://vectorchi.github.io/fun-loader/), a web component that shows messages like "Opening a few mental tabs…" while an AI response or other slow task runs, and switches to lines that acknowledge the wait after 8 and 20 seconds.

- **`<FunLoader>` everywhere:** auto-imported, with typed props. The raw `<fun-loader>` tag works in templates too.
- **Only the themes you list** reach the browser.
- **App-wide defaults** for theme, icon, interval and label.
- **Server-rendered** without hydration warnings.

## Install

```sh
npx nuxi module add @vectorchi/nuxt-fun-loader
```

This installs the package and adds it to `modules` in `nuxt.config.ts`. Or do it by hand:

```sh
npm install @vectorchi/nuxt-fun-loader
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vectorchi/nuxt-fun-loader'],
})
```

## Use

```vue
<script setup lang="ts">
const loading = ref(false)
</script>

<template>
  <FunLoader v-if="loading" theme="dev" />
</template>
```

`<FunLoader>` takes the same props as the core Vue component: `theme`, `messages`, `stages`, `interval`, `paused`, `icon-only`, `ordered`, `label` and `icon`. See [Options](https://vectorchi.github.io/fun-loader/reference/options) for what each one does.

Keep `messages` and `stages` in a constant or a `ref`, not an array written inline in the template: a new array on every render restarts the rotation.

## Configure

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@vectorchi/nuxt-fun-loader'],
  funLoader: {
    // Only these themes are bundled.
    themes: ['thinking', 'dev'],
    // Applied to every <FunLoader>. Props on a single loader win.
    defaults: { icon: 'orbit', interval: 3000, label: 'Loading' },
  },
})
```

| Option | Type | Default | What it does |
| --- | --- | --- | --- |
| `themes` | `'all'` or a list of theme names | `'all'` | Which themes ship to the browser. Themes: `thinking`, `dev`, `design`, `art`, `calm`, `finance`, `kitchen`, `transfer`. |
| `defaults` | `{ theme, icon, interval, label }` | `{}` | Props applied to every `<FunLoader>`. |
| `prefix` | `string` | `'Fun'` | The component is named `<prefix>Loader`. |

Notes:

- If `themes` leaves out `thinking` (the element's default) and you don't set `defaults.theme`, the first theme in the list becomes the default.
- An unknown name in `themes` stops the build with the list of valid names.
- A loader that asks for a theme left out of the build shows a single "Thinking…".

## The raw tag

The module tells Vue that `<fun-loader>` is a custom element, and keeps any `isCustomElement` function you already set. The element and your chosen themes are registered for you, so this works with no imports:

```vue
<template>
  <fun-loader theme="calm" />
</template>
```

`defaults` don't apply to the raw tag. Use `<FunLoader>` if you want them.

## Server rendering

Nothing to set up. The server sends `<fun-loader>` with its attributes, and the element fills in its messages when the page's JavaScript runs. No `<ClientOnly>` wrapper is needed, and hydration doesn't warn.

To start or stop a loader with the request, use `v-if`: the wait clock starts when the loader enters the page.

## Size

What the module adds to your app's client JavaScript, brotli: about 2.5 kB with one theme and 3.9 kB with all eight. Run `npm run size` in this repo to measure it yourself.

## Compatibility

Nuxt 4 and later. Nuxt 3 reached end of life in July 2026.

## Development

```sh
npm install
npm run dev:prepare   # generate types and stub the module
npm run dev           # playground at http://localhost:3000
npm run lint
npm run typecheck
npm test              # needs Chromium; set CHROMIUM_PATH to use an installed browser
npm run size
```

## Links

- [fun-loader docs](https://vectorchi.github.io/fun-loader/)
- [Core package](https://github.com/VectorChi/fun-loader)

## License

MIT
