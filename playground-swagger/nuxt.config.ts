export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  compatibilityDate: '2024-12-01',

  mock: {
    enable: true,
    prefix: '/mock',
    // Swagger 2.0 Spec File Mode
    openapi: '../packages/sample-swagger/swagger.yaml',
  },
})
