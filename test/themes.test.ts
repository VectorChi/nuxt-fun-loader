import * as coreThemes from '@vectorchi/fun-loader/themes/index'
import { describe, expect, it } from 'vitest'
import { buildClient } from './build'

const { thinking, ...others } = coreThemes

// One stage-0 line per other theme that thinking does not share, minus the ellipsis and
// anything a minifier might escape, so it can be found as-is in the client output.
const markers = Object.values(others).map((theme) => {
  const line = theme.messages.find(m => !thinking.messages.includes(m) && /^[\w ,.]+…$/.test(m))
  if (!line) throw new Error(`No plain marker line in ${theme.name}`)
  return line.slice(0, -1)
})

describe('tree-shaking', () => {
  it('ships only the listed themes', async () => {
    const js = (await buildClient('themes', 'thinking', { funLoader: { themes: ['thinking'] } })).join('\n')
    expect(js).toContain(thinking.messages.find(m => /^[\w ,.]+…$/.test(m))!.slice(0, -1))
    for (const marker of markers) expect(js).not.toContain(marker)
  })

  it('ships every theme with themes: all', async () => {
    const js = (await buildClient('themes', 'all', { funLoader: { themes: 'all' } })).join('\n')
    for (const marker of markers) expect(js).toContain(marker)
  })
})
