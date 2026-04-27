import './index.css'

import { VueQueryPlugin } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { createHead } from '@unhead/vue/client'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'

import App from './app.vue'
import { queryClient } from './lib/vue-query'
import router from './router'

const enableMocking = async () => {
  if (import.meta.env.VITE_APP_ENABLE_API_MOCKING !== 'true') {
    return
  }

  try {
    const { worker } = await import('./testing/mocks/browser')
    const { initializeDb } = await import('./testing/mocks/db')

    await initializeDb()
    await worker.start({
      onUnhandledRequest(request, print) {
        // Ignore static file requests (Vite HMR, modules, assets)
        const url = new URL(request.url)
        const isStaticFile =
          url.pathname.startsWith('/src/') ||
          url.pathname.startsWith('/node_modules/') ||
          url.pathname.startsWith('/@') ||
          url.pathname.match(/\.(js|ts|vue|css|svg|png|jpg|jpeg|gif|woff|woff2|ttf|eot)(\?|$)/)

        if (isStaticFile) {
          return // Ignore without warning
        }

        // Log unhandled API requests
        print.warning()
      },
    })
    return
  } catch (error) {
    console.error('Failed to start MSW worker:', error)
    return
  }
}

enableMocking().then(() => {
  const app = createApp(App)

  // Setup global error handler
  app.config.errorHandler = (err, instance, info) => {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Global error:', err)
      console.error('Component:', instance?.$options?.name || instance)
      console.error('Info:', info)
    }

    // In production, you might want to send errors to a logging service
    // Example: errorReportingService.logError(err, { component: instance, info })

    // Re-throw to be caught by ErrorBoundary
    throw err
  }

  app.use(createPinia())
  app.use(router)
  app.use(VueDOMPurifyHTML)

  // Setup Vue Query
  app.use(VueQueryPlugin, {
    queryClient,
  })

  // Setup Unhead for SEO
  const head = createHead()
  app.use(head)

  // Setup Vue Query Devtools (only in development)
  if (import.meta.env.DEV) {
    app.component('VueQueryDevtools', VueQueryDevtools)
  }

  app.mount('#app')
})
