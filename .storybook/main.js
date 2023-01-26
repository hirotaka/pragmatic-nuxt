const path = require('path')
const { loadConfigFromFile, mergeConfig } = require('vite')

module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss')
        }
      }
    }
  ],
  framework: '@storybook/vue3',
  core: {
    builder: '@storybook/builder-vite'
  },
  async viteFinal(config, { configType }) {
    config.plugins = [
      ...config.plugins.filter((p) => !Array.isArray(p)),
      require('@vitejs/plugin-vue-jsx')({
        exclude: [/\.stories\.(t|j)sx?$/, /node_modules/]
      }),
      require('unplugin-vue-components/vite')({
        dirs: ['./components/**']
      }),
      require('unplugin-auto-import/vite')({
        imports: ['vue'],
        dirs: ['./composables/**', './utils/**'],
        vueTemplate: true
      })
    ]

    return mergeConfig(config, {
      plugins: [],
      resolve: {
        alias: {
          '~': path.resolve(__dirname, '../')
        }
      }
    })
  }
}
