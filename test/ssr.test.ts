import { fileURLToPath } from 'node:url'
import { $fetch, createPage, fetch, setup, url } from '@nuxt/test-utils/e2e'
import { calm } from '@vectorchi/fun-loader/themes/calm'
import { dev } from '@vectorchi/fun-loader/themes/dev'
import { describe, expect, it } from 'vitest'

// Locally, point this at any Chromium (Chrome, Brave, Edge). CI installs Playwright's own.
const executablePath = process.env.CHROMIUM_PATH || undefined

// The attributes of the server-rendered <fun-loader id="...">.
function attrs(html: string, id: string) {
  const tag = html.match(new RegExp(`<fun-loader[^>]*\\bid="${id}"[^>]*>`))?.[0] ?? ''
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]))
}

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssr', import.meta.url)),
    browser: true,
    browserOptions: { type: 'chromium', launch: { executablePath } },
  })

  it('renders the page on the server', async () => {
    const res = await fetch('/')
    expect(res.status).toBe(200)
    const html = await $fetch<string>('/')
    // Defaults from nuxt.config, with dev as the first listed theme because thinking is left out.
    expect(attrs(html, 'component')).toEqual({ id: 'component', theme: 'dev', icon: 'orbit', label: 'Loading the page' })
    // Props on one loader win over the defaults, and false booleans are not rendered.
    expect(attrs(html, 'override')).toEqual({ id: 'override', theme: 'calm', icon: 'pulse', label: 'Saving', interval: '900', ordered: 'true' })
    // The raw tag is left alone.
    expect(attrs(html, 'raw')).toEqual({ id: 'raw', theme: 'calm' })
  })

  it('hydrates without warnings and rotates messages on the client', async () => {
    const logs: string[] = []
    const page = await createPage()
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`))
    page.on('pageerror', err => logs.push(`pageerror: ${err.message}`))
    await page.goto(url('/'), { waitUntil: 'hydration' })

    const text = (id: string) => page.locator(`#${id} [part="text"]`).textContent()
    expect(dev.messages).toContain(await text('component'))
    expect(calm.messages).toContain(await text('override'))
    expect(calm.messages).toContain(await text('raw'))
    expect(['One moment…', 'Almost there…']).toContain(await text('custom'))

    // Array props reach the element as properties after hydration.
    expect(await page.locator('#custom').evaluate(el => (el as HTMLElement & { messages: string[] }).messages)).toEqual(['One moment…', 'Almost there…'])

    // The 900 ms loader moves on to its next message.
    const first = await text('override')
    await page.waitForFunction(was => document.querySelector('#override')?.shadowRoot?.querySelector('[part="text"]')?.textContent !== was, first, { timeout: 3000 })

    // Booleans switch on and off after hydration.
    const state = () => page.locator('#toggle').evaluate(el => [el.hasAttribute('paused'), el.hasAttribute('icon-only')])
    expect(await state()).toEqual([false, false])
    await page.click('#flip')
    await page.waitForFunction(() => document.querySelector('#toggle')?.hasAttribute('icon-only'))
    expect(await state()).toEqual([true, true])
    await page.click('#flip')
    await page.waitForFunction(() => !document.querySelector('#toggle')?.hasAttribute('icon-only'))
    expect(await state()).toEqual([false, false])

    expect(logs.filter(l => /hydrat|mismatch|error|warn/i.test(l))).toEqual([])
    await page.close()
  })
})
