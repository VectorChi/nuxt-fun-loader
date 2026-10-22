# Listing on nuxt.com/modules

## Status

`modules/fun-loader.yml` was generated with nuxt/modules' own `pnpm sync fun-loader VectorChi/nuxt-fun-loader` on 2026-10-22, edited, checked with their `pnpm sync` and `pnpm lint`, and pushed to the fork as branch `add-fun-loader` (github.com/VectorChi/nuxt-modules). The pull request to nuxt/modules is opened by hand.

## The file

```yaml
name: fun-loader
description: >-
  Rotating, playful loading messages for AI responses and other slow tasks, with
  only the themes you use in the bundle.
repo: VectorChi/nuxt-fun-loader
npm: '@vectorchi/nuxt-fun-loader'
icon: fun-loader.svg
github: https://github.com/VectorChi/nuxt-fun-loader
website: https://vectorchi.github.io/fun-loader/
learn_more: https://vectorchi.github.io/fun-loader/frameworks/nuxt
category: UI Components
type: 3rd-party
maintainers:
  - name: Adimchi Oka
    github: VectorChi
    twitter: vector_chi
compatibility:
  nuxt: '>=4.0.0'
  requires: {}
```

Set by hand: `website`, `learn_more`, `category` (the sync picked `Devtools`), the maintainer's name and `icon` (the core docs logo, `docs/public/logo.svg`, added as `icons/fun-loader.svg`). Their CI added `twitter: vector_chi` from the GitHub profile. Everything else comes from the sync.

## What changed from the first draft

- **`type` is `3rd-party`, not `community`.** The sync sets it from the repo: `community` is for modules in the nuxt-modules org, everything else is `3rd-party`.
- **No question about the scoped name.** 115 listed modules have scoped npm names, all `3rd-party`, so a scoped name is normal for a listed module.

## Pull request text

Title: `feat: add fun-loader` (the convention in merged PRs, for example "feat: add eve module").

> Adds [`@vectorchi/nuxt-fun-loader`](https://www.npmjs.com/package/@vectorchi/nuxt-fun-loader) ([repo](https://github.com/VectorChi/nuxt-fun-loader)), the Nuxt module for [fun-loader](https://vectorchi.github.io/fun-loader/): a web component that shows rotating loading messages while an AI response or other slow task runs, and switches to lines that acknowledge the wait after 8 and 20 seconds.
>
> The module auto-imports `<FunLoader>`, bundles only the themes listed in `funLoader.themes`, applies app-wide defaults, and marks `<fun-loader>` as a custom element without replacing an existing `isCustomElement`. It is tested for SSR and hydration on Nuxt 4.0 and the latest 4.x, and published with npm provenance.
>
> Docs: https://vectorchi.github.io/fun-loader/frameworks/nuxt

## Optional later

- A StackBlitz demo linked from the README, which the module guide recommends.
