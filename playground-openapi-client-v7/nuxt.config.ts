export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  compatibilityDate: '2024-12-01',

  mock: {
    enable: true,
    prefix: '/mock',
    // Client Package Mode: openapi-generator v7 format 클라이언트 사용
    openapi: {
      package: '@mock-fried/openapi-client-v7',
      apisDir: 'src/apis',
      modelsDir: 'src/models',
    },
  },
})
