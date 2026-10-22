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
