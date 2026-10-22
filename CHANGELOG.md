# Changelog

## 0.1.0

First release.

- `<FunLoader>` is auto-imported, with the same props as `@vectorchi/fun-loader/vue`. The raw `<fun-loader>` tag works in templates, and an `isCustomElement` function the app already set is kept.
- `funLoader.themes` bundles only the listed themes. Unknown names stop the build.
- `funLoader.defaults` sets `theme`, `icon`, `interval` and `label` for every `<FunLoader>`.
- `funLoader.prefix` renames the component (`<prefix>Loader`).
- Server-rendered with no hydration warnings. Booleans that are off are not written to the server HTML, so loaders don't start paused or ordered before hydration.
- Requires Nuxt 4 and `@vectorchi/fun-loader` 0.5.
