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
      rolldownOptions: {
        output: {
          codeSplitting: {
            includeDependenciesRecursively: true,
            groups: [
              // Vendor chunks - separate large dependencies
              { name: 'vue-vendor', test: /[\\/]node_modules[\\/](?:vue|vue-router|pinia)[\\/]/ },
              { name: 'query-vendor', test: /[\\/]node_modules[\\/]@tanstack[\\/]vue-query[\\/]/ },
              { name: 'ui-vendor', test: /[\\/]node_modules[\\/](?:reka-ui|lucide-vue-next)[\\/]/ },
              // Utility chunks
              { name: 'utils', test: /[\\/]node_modules[\\/](?:axios|zod|clsx|tailwind-merge)[\\/]/ },
              // Form validation chunk
              { name: 'form', test: /[\\/]node_modules[\\/](?:vee-validate|@vee-validate[\\/]zod)[\\/]/ },
              // Content processing
              { name: 'content', test: /[\\/]node_modules[\\/](?:marked|vue-dompurify-html|dayjs)[\\/]/ },
            ],
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
