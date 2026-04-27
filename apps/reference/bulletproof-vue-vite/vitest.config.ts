import { fileURLToPath } from 'node:url';
import { defineConfig, configDefaults } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  // Vitest plugin type compatibility issue in CI between Vite 5.x and 6.x
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    setupFiles: ['./src/testing/setup-tests.ts'],
    env: {
      VITE_APP_API_URL: '',
    },
  },
});
