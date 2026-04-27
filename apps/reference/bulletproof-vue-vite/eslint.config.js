import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginImport from 'eslint-plugin-import-x'
import pluginCheckFile from 'eslint-plugin-check-file'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import pluginTestingLibrary from 'eslint-plugin-testing-library'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/*.cjs'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),

  {
    name: 'app/custom-rules',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      // Allow single-word component names for UI primitives
      'vue/multi-word-component-names': 'off',
      // Allow require() in config files
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    name: 'app/storybook-rules',
    files: ['src/stories/**/*.{ts,tsx}'],
    rules: {
      // Allow any type in Storybook files for render functions
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },

  // Testing Library rules for unit tests
  {
    name: 'app/testing-library-rules',
    files: ['src/**/__tests__/**/*.{ts,tsx,vue}', 'src/**/*.{spec,test}.{ts,tsx,vue}'],
    plugins: {
      'testing-library': pluginTestingLibrary,
    },
    rules: {
      ...pluginTestingLibrary.configs['flat/vue'].rules,
    },
  },

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  // Import restrictions to enforce Feature-Sliced Design architecture
  {
    name: 'app/import-restrictions',
    files: ['src/**/*.{ts,mts,tsx,vue}'],
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Prevent features/auth from importing from features/discussions
            {
              target: './src/features/auth',
              from: './src/features/!(auth)',
            },
            // Prevent features/comments from importing from other features
            {
              target: './src/features/comments',
              from: './src/features/!(comments)',
            },
            // Prevent features/discussions from importing from other features
            {
              target: './src/features/discussions',
              from: './src/features/!(discussions)',
            },
            // Prevent features/teams from importing from other features
            {
              target: './src/features/teams',
              from: './src/features/!(teams)',
            },
            // Prevent features/users from importing from other features
            {
              target: './src/features/users',
              from: './src/features/!(users)',
            },

            // features can't import from app
            {
              target: './src/features',
              from: './src/app',
            },

            // components can't import from features or app
            {
              target: './src/components',
              from: './src/features',
            },
            {
              target: './src/components',
              from: './src/app',
            },

            // lib can't import from features or app
            {
              target: './src/lib',
              from: './src/features',
            },
            {
              target: './src/lib',
              from: './src/app',
            },

            // utils can't import from features or app
            {
              target: './src/utils',
              from: './src/features',
            },
            {
              target: './src/utils',
              from: './src/app',
            },

            // stores can't import from features or app
            {
              target: './src/stores',
              from: './src/features',
            },
            {
              target: './src/stores',
              from: './src/app',
            },
          ],
        },
      ],
    },
  },

  // Enforce KEBAB_CASE naming convention for files and folders
  {
    name: 'app/naming-conventions',
    files: ['src/**/*.{ts,tsx,vue}'],
    plugins: {
      'check-file': pluginCheckFile,
    },
    rules: {
      // Enforce KEBAB_CASE for file names
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/**/*.{ts,tsx,vue}': 'KEBAB_CASE',
        },
        {
          // Ignore middle extensions (e.g., .spec.ts, .test.ts, .stories.ts)
          ignoreMiddleExtensions: true,
        },
      ],
      // Enforce KEBAB_CASE for folder names
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/': 'KEBAB_CASE',
        },
        {
          // Allow __tests__ folders as they follow JavaScript/TypeScript conventions
          ignoreWords: ['__tests__'],
        },
      ],
    },
  },

  // Enforce import order for better code organization
  {
    name: 'app/import-order',
    files: ['src/**/*.{ts,mts,tsx,vue}'],
    plugins: {
      import: pluginImport,
    },
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          warnOnUnassignedImports: false,
        },
      ],
    },
  },

  // Enforce accessibility best practices
  {
    name: 'app/a11y-rules',
    files: ['src/**/*.{vue}'],
    plugins: {
      'vuejs-accessibility': pluginVueA11y,
    },
    rules: {
      ...pluginVueA11y.configs.recommended.rules,
    },
  },

  skipFormatting,
]
