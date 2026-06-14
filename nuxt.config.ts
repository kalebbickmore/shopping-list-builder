// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  // runtimeConfig is the heart of a "protected" API.
  // Top-level keys are SERVER-ONLY: available via useRuntimeConfig() on the
  // server, and NEVER bundled into the browser. This is where a real secret key
  // lives. Override in production by setting NUXT_FOOD_API_KEY in Vercel, the
  // value stays on the server. Anything under `public` IS shipped to the
  // browser, so never put secrets there.
  runtimeConfig: {
    foodApiKey: '', // set via NUXT_FOOD_API_KEY; empty is fine, OpenFoodFacts needs no key
    public: {}
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // @nuxt/fonts (bundled with @nuxt/ui) can't see family names hidden behind our
  // `var(--font-*)` tokens, so declare them explicitly. Fraunces ships italic +
  // optical sizing for the display voice; Hanken Grotesk is the body face.
  fonts: {
    families: [
      { name: 'Fraunces', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Hanken Grotesk', provider: 'google', weights: [400, 500, 600, 700] }
    ]
  }
})
