export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  compatibilityDate: '2024-12-01',

  mock: {
    enable: true,
    prefix: '/mock',
    // 생성된 클라이언트 패키지 사용 (새로운 방식)
    openapi: {
      package: '@ptcorp-eosikahair/openapi',
      apisDir: 'src/apis',
      modelsDir: 'src/models',
    },
    // 기존 방식: 로컬 OpenAPI 스펙 파일 사용
    // openapi: './mocks/openapi.yaml',
  },
})
