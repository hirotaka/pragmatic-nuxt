import { setAbsoluteSqliteDatabaseUrlForPrisma } from './prisma/utils'

setAbsoluteSqliteDatabaseUrlForPrisma()

export default defineNuxtConfig({
  imports: {
    dirs: ['composables/**', 'utils/**']
  },
  modules: [
    '@huntersofbook/naive-ui-nuxt',
    '@nuxtjs/tailwindcss',
    'nuxt-svgo',
    '@pinia/nuxt',
    '@sidebase/nuxt-auth'
  ],
  extends: ['@sidebase/core'],
  auth: {
    enableGlobalAppMiddleware: true,
    origin: 'http://localhost:3000'
  },
  typescript: {
    shim: false,
    // Exclude nuxt.config.ts for a while
    // https://github.com/nuxt/nuxt/issues/13897#issuecomment-1429669152
    tsConfig: {
      exclude: ['../cypress', '../nuxt.config.ts']
    }
  },
  ssr: false
})
