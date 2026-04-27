import { createHead } from '@unhead/vue/client'

import { Head } from '../'

import { render, waitFor } from '@/testing/test-utils'

test('should add proper page title and meta description', async () => {
  const title = 'Hello World'
  const titleSuffix = ' | Bulletproof Vue'
  const description = 'This is a description'

  const head = createHead()

  render(Head, {
    props: { title, description },
    global: {
      plugins: [head],
    },
  })

  await waitFor(() => expect(document.title).toEqual(title + titleSuffix))

  await waitFor(() => {
    const metaDescription = document.querySelector("meta[name='description']")
    expect(metaDescription?.getAttribute('content')).toEqual(description)
  })
})
