import { readdir, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { brotliCompressSync, gzipSync } from 'node:zlib'
import { buildNuxt, loadNuxt } from '@nuxt/kit'
import type { NuxtConfig } from '@nuxt/schema'

const fixtures = fileURLToPath(new URL('./fixtures', import.meta.url))

/** Builds a fixture for production and returns its client JavaScript, one string per file. */
export async function buildClient(fixture: string, name: string, overrides: NuxtConfig = {}): Promise<string[]> {
  const rootDir = join(fixtures, fixture)
  const outDir = join(rootDir, '.output-test', name)
  const buildDir = join(rootDir, '.nuxt-test', name)
  // Start clean: chunks left over from an earlier build would be counted twice.
  await Promise.all([outDir, buildDir].map(dir => rm(dir, { recursive: true, force: true })))
  const nuxt = await loadNuxt({
    cwd: rootDir,
    dev: false,
    overrides: {
      ...overrides,
      buildDir,
      nitro: { output: { dir: outDir } },
      logLevel: 'silent',
    },
  })
  try {
    await buildNuxt(nuxt)
  }
  finally {
    await nuxt.close()
  }
  const dir = join(outDir, 'public', '_nuxt')
  const files = (await readdir(dir)).filter(f => f.endsWith('.js'))
  return Promise.all(files.map(f => readFile(join(dir, f), 'utf8')))
}

/** Minified, gzip and brotli bytes of a set of files. */
export function sizes(files: string[]) {
  const all = Buffer.from(files.join('\n'))
  return { min: all.length, gzip: gzipSync(all).length, brotli: brotliCompressSync(all).length }
}
