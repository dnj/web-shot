import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import image from '@rollup/plugin-image';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
    'unplugin-font-to-buffer/nuxt',
    'v-satori/nuxt',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }))
      })
    },
    '@nuxtjs/i18n',
    //...
  ],
  i18n: {
    vueI18n: './i18n.config.ts'
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  nitro: {
    storage: {
      captures: {
        driver: 'fs',
        base: './.data/captures'
      }
    },
    rollupConfig: {
      plugins: [
        image()
      ]
    }
  }
})
