import type { Preview } from '@storybook/vue3'
import { vueRouter } from 'storybook-vue3-router'
import { setup } from '@storybook/vue3'

import '../src/index.css'

import VueDOMPurifyHTML from 'vue-dompurify-html'

setup((app) => {
  app.use(VueDOMPurifyHTML)
})

const preview: Preview = {
  decorators: [vueRouter()],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
