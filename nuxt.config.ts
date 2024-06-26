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
    ['nuxt-mail', {
      message: {
        to: 'hi@web-shot.ir',
      },
      smtp: {
        host: "mail.jeyserver.com",
        port: 587,
        auth: {
          user: 'hi@web-shot.ir',
          pass: process.env.SMTP_PASSWORD,
        },
      },
    }],
  ],
  i18n: {
    vueI18n: './i18n.config.ts',
    locales: ['en', 'fa'],
    defaultLocale: 'en',
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
