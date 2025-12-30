export default defineNuxtConfig({
  modules: ['../src/module'],

  devtools: { enabled: true },

  compatibilityDate: '2024-12-01',

  mock: {
    enable: true,
    prefix: '/mock',
    // @airian/proto 패키지의 proto 파일 사용
    // 패키지 설치 후 실제 proto 파일 경로로 수정 필요
    proto: './mocks/example.proto',
  },
})
