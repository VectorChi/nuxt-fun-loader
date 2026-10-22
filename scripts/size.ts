// Client cost of the loader: the themes fixture built with one theme and with all of them,
// minus the same app built without the module. Run with `npm run size`.
import { buildClient, sizes } from '../test/build.ts'

const base = sizes(await buildClient('baseline', 'baseline'))
const rows = [
  ['themes: [\'thinking\']', sizes(await buildClient('themes', 'thinking', { funLoader: { themes: ['thinking'] } }))],
  ['themes: \'all\'', sizes(await buildClient('themes', 'all', { funLoader: { themes: 'all' } }))],
] as const

const kb = (n: number) => `${(n / 1000).toFixed(2)} kB`
console.log('Added to the client JavaScript, compared with the same app without the module:\n')
console.log('| Config | Minified | Gzip | Brotli |\n| --- | --- | --- | --- |')
for (const [name, s] of rows) {
  console.log(`| \`${name}\` | ${kb(s.min - base.min)} | ${kb(s.gzip - base.gzip)} | ${kb(s.brotli - base.brotli)} |`)
}
