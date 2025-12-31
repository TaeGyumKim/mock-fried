export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  compatibilityDate: '2024-12-01',

  mock: {
    enable: true,
    prefix: '/mock',
    // Spec File Mode: OpenAPI 스펙 파일 직접 사용
    openapi: '../packages/sample-openapi/openapi.yaml',
  },
})
