import { describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'
import { expectNoClientErrors } from './utils'

await setup({
  server: true,
  browser: true
})

describe('app', () => {
  it.skip('renders welcome page', async () => {
    const html = await $fetch('/')

    // Shows expected text
    expect(html).toContain('Bulletproof Nuxt')

    await expectNoClientErrors('/')
  })
})
