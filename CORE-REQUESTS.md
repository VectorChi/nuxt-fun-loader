# Requests for the core package

Changes in `@vectorchi/fun-loader` that would simplify this module. None of them block v0.1.0; each one says what the module does today.

## 1. A Vue component that does not register every theme

**Problem:** `@vectorchi/fun-loader/vue` calls `defineAll()` on import, so any app that imports it ships all eight themes. The module cannot limit themes and still use that component.

**Ask:** export the component without the side effect, for example `@vectorchi/fun-loader/vue/component` (or `FunLoaderBase` from `/vue`, with `defineAll()` moved so it is tree-shaken when unused). It would call only `define()`.

**Today:** the module keeps its own copy of the component (`src/runtime/app/components/FunLoader.ts`). It has to be updated by hand when core adds a prop.

## 2. App-wide defaults for the element

**Problem:** `DEFAULT_THEME`, `DEFAULT_ICON` and `DEFAULT_INTERVAL` are constants. A raw `<fun-loader>` tag cannot pick up an app's defaults.

**Ask:** a setter, for example `setDefaults({ theme, icon, interval, label })` exported from `/element`, read by the getters when an attribute is missing.

**Today:** `funLoader.defaults` applies to `<FunLoader>` only, and the docs say so.

## 3. A list of theme names

**Problem:** the module hard-codes the eight theme names to give `funLoader.themes` a literal type.

**Ask:** export a `THEME_NAMES` constant (`as const`) or a `FunLoaderThemeName` union type from `/element` or `/themes/index`.

**Today:** a test fails when the core's themes and the module's list drift apart.
