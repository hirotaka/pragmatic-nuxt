import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [tailwindcss(), vue(), vueJsx(), vueDevTools()],
    define: {
      // Set default values for environment variables
      'import.meta.env.VITE_APP_API_URL': JSON.stringify(
        env.VITE_APP_API_URL ?? '',
      ),
      'import.meta.env.VITE_APP_ENABLE_API_MOCKING': JSON.stringify(
        env.VITE_APP_ENABLE_API_MOCKING || 'true',
      ),
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const chunks: Record<string, string[]> = {
              'vue-vendor': ['vue', 'vue-router', 'pinia'],
              'query-vendor': ['@tanstack/vue-query'],
              'ui-vendor': ['reka-ui', 'lucide-vue-next'],
              utils: ['axios', 'zod', 'clsx', 'tailwind-merge'],
              form: ['vee-validate', '@vee-validate/zod'],
              content: ['marked', 'vue-dompurify-html', 'dayjs'],
            };
            for (const [chunkName, deps] of Object.entries(chunks)) {
              if (deps.some((dep) => id.includes(`node_modules/${dep}/`))) {
                return chunkName;
              }
            }
          },
        },
      },
      // Increase chunk size warning limit to 1000kb
      chunkSizeWarningLimit: 1000,
      // Enable source maps for production debugging (optional)
      sourcemap: false,
    },
  };
});
