export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  compatibilityDate: '2024-12-01',

  mock: {
    enable: true,
    prefix: '/mock',
    // @mock-fried/sample-proto 패키지의 전체 proto 디렉토리 사용
    proto: '../packages/sample-proto/protos',
  },
})
