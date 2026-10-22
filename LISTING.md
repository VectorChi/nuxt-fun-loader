# Listing on nuxt.com/modules (draft)

Not submitted. Everything here waits for approval.

## How listing works

The ecosystem page says: "To be listed, open a pull request to nuxt/modules, following the contribution guide." The nuxt/modules README asks for:

1. Fork and clone nuxt/modules, then `pnpm install`.
2. `pnpm sync fun-loader VectorChi/nuxt-fun-loader`, which generates `modules/fun-loader.yml` from this repo's `package.json`. It reads the published npm package, so it only works after v0.1.0 is on npm.
3. Set `category` to a value from `lib/categories.ts`. Optionally add an icon to `icons/` and set `icon`.
4. Open a pull request. No issue is needed first.

So the listing is a pull request, not an issue. An issue on nuxt/modules is only for asking to move a module into the `nuxt-modules` org.

## Expected `modules/fun-loader.yml`

`pnpm sync` writes most of this; the fields marked "by hand" are ours to set.

```yaml
name: fun-loader                       # by hand: canonical name
description: Rotating, playful loading messages for AI responses and other slow tasks, with only the themes you use in the bundle.
repo: VectorChi/nuxt-fun-loader        # by hand
npm: '@vectorchi/nuxt-fun-loader'
icon: fun-loader.svg                   # by hand, optional: needs an SVG in icons/
github: https://github.com/VectorChi/nuxt-fun-loader
website: https://vectorchi.github.io/fun-loader/
learn_more: https://vectorchi.github.io/fun-loader/frameworks/nuxt
category: UI Components                # by hand: from lib/categories.ts
type: community                        # by hand
maintainers:
  - name: Adimchi Oka
    github: VectorChi
compatibility:
  nuxt: '>=4.0.0'
  requires: {}
```

The README says the description must not mention Nuxt or Nuxt versions. `package.json`'s description already follows that, so `pnpm sync` copies it as is; `nuxt` and `nuxt-module` are in `keywords` for npm search.

## Pull request text

> **Add fun-loader**
>
> Adds [`@vectorchi/nuxt-fun-loader`](https://www.npmjs.com/package/@vectorchi/nuxt-fun-loader) ([repo](https://github.com/VectorChi/nuxt-fun-loader)), the Nuxt module for [fun-loader](https://vectorchi.github.io/fun-loader/): a web component that shows rotating loading messages while an AI response or other slow task runs, and switches to lines that acknowledge the wait after 8 and 20 seconds.
>
> The module auto-imports `<FunLoader>`, registers only the themes listed in `funLoader.themes`, applies app-wide defaults, and marks `<fun-loader>` as a custom element without replacing an existing `isCustomElement`. It is tested for SSR and hydration on Nuxt 4.0 and the latest 4.x.
>
> **A question about the name.** The package is scoped, `@vectorchi/nuxt-fun-loader`, to match the core package `@vectorchi/fun-loader`. The module author guide's ecosystem page describes scoped names (its example is `@my-company/nuxt-auth`) as typical of private or personal modules, and community modules as usually `nuxt-*`. Can a scoped community module be listed? If you'd prefer the unscoped `nuxt-fun-loader`, I can publish under that name too.
>
> Repo: https://github.com/VectorChi/nuxt-fun-loader
> npm: https://www.npmjs.com/package/@vectorchi/nuxt-fun-loader

## Still missing before the PR

- **Published package.** `pnpm sync` and the reviewers need v0.1.0 on npm.
- **Public repo** at github.com/VectorChi/nuxt-fun-loader with CI passing.
- **Category.** `UI Components` fits best of the 28 in `lib/categories.ts` (checked 2026-10-22). `AI` is the other candidate, since the main use is waiting on AI responses.
- **Icon (optional).** An SVG for `icons/`. The core docs site has none yet.
- **Docs page.** `learn_more` points at `/frameworks/nuxt` on the core site, which exists only after `docs/nuxt.md` is added there.
- **StackBlitz demo (optional).** The best-practices page recommends one in the README.
