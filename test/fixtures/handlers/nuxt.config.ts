import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [MyModule],

  mock: {
    enable: true,
    prefix: '/mock',
    openapi: './mocks/openapi.yaml',
  },
})
