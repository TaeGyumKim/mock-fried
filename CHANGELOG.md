# Changelog

## [1.4.1](https://github.com/TaeGyumKim/mock-fried/compare/v1.4.0...v1.4.1) (2026-01-14)


### Bug Fixes

* move @nuxt/kit to peerDependencies for Nuxt 3 compatibility ([debd0b7](https://github.com/TaeGyumKim/mock-fried/commit/debd0b71df707ca44995551d35d914c40265a590))

## [1.4.0](https://github.com/TaeGyumKim/mock-fried/compare/v1.3.1...v1.4.0) (2026-01-06)


### Features

* add Swagger 2.0 spec file support ([533879a](https://github.com/TaeGyumKim/mock-fried/commit/533879a103ca96bf43fbccd05450da64a1772448))
* sync Swagger 2.0 spec with OpenAPI 3.x parity ([7192a0a](https://github.com/TaeGyumKim/mock-fried/commit/7192a0aa1f6d10685f7409f5eae8bb2ae3161f43))


### Bug Fixes

* resolve lint errors ([8f6a096](https://github.com/TaeGyumKim/mock-fried/commit/8f6a096715934bdb9fffc6d3de2f1bbe7cda0997))
* resolve type-check errors ([d4595ad](https://github.com/TaeGyumKim/mock-fried/commit/d4595adaa4de819289bf6920c35d24282b439e38))

## [1.3.1](https://github.com/TaeGyumKim/mock-fried/compare/v1.3.0...v1.3.1) (2026-01-05)


### Bug Fixes

* correct listFieldName type from null to undefined ([3061556](https://github.com/TaeGyumKim/mock-fried/commit/30615567ec8fb0bb9d0a1d8a59ce54a68835c0ea))
* remove explicit any type in refactored-utils.test.ts ([37ab1c0](https://github.com/TaeGyumKim/mock-fried/commit/37ab1c041045cb1cf7df19fe3f30927a320a08bb))

## [1.3.0](https://github.com/TaeGyumKim/mock-fried/compare/v1.2.1...v1.3.0) (2026-01-05)


### Features

* add isBackward query parameter support for cursor pagination ([c1fd77c](https://github.com/TaeGyumKim/mock-fried/commit/c1fd77ca98679cfc23317a197051a52ec4bf22df))


### Bug Fixes

* remove invalid boolean comparison in query parameter check ([6d15549](https://github.com/TaeGyumKim/mock-fried/commit/6d1554971ae076cc47b78bbae1b4dc839f443b08))
* resolve lint errors in test files ([b09eef7](https://github.com/TaeGyumKim/mock-fried/commit/b09eef7bc40008d51a596b35423f5cea42442ef8))

## [1.2.1](https://github.com/TaeGyumKim/mock-fried/compare/v1.2.0...v1.2.1) (2026-01-05)


### Bug Fixes

* support new openapi-generator format in client-parser ([1065e95](https://github.com/TaeGyumKim/mock-fried/commit/1065e9597fad4b097f0ae60dde51934ea5beed4d))

## [1.2.0](https://github.com/TaeGyumKim/mock-fried/compare/v1.1.2...v1.2.0) (2026-01-02)


### Features

* add bidirectional cursor pagination ([afbe159](https://github.com/TaeGyumKim/mock-fried/commit/afbe159309083c9597eb386d1470403d7ffc0f59))
* **openapi:** add AdvancedCases and Activities APIs ([cb75f40](https://github.com/TaeGyumKim/mock-fried/commit/cb75f40d6d831ee3b2dbf07e673975b6f3c11571))
* **playground:** add AdvancedCases and Activities to API testers ([1e4413e](https://github.com/TaeGyumKim/mock-fried/commit/1e4413e0cd5909211e13b31e45b6c6754bca7680))
* **proto:** add AdvancedService and ActivityService ([6643b5b](https://github.com/TaeGyumKim/mock-fried/commit/6643b5b88de9074757ee1275139164fee8916f65))

## [1.1.2](https://github.com/TaeGyumKim/mock-fried/compare/v1.1.1...v1.1.2) (2026-01-02)


### Bug Fixes

* **openapi:** resolve $ref schemas in pagination responses ([9c403c6](https://github.com/TaeGyumKim/mock-fried/commit/9c403c67aa22313251984afe253984b80c2dc59d))

## [1.1.1](https://github.com/TaeGyumKim/mock-fried/compare/v1.1.0...v1.1.1) (2026-01-02)


### Bug Fixes

* **proto:** improve type handling for proto-loader string values ([52d864a](https://github.com/TaeGyumKim/mock-fried/commit/52d864a6f34ba24491275e671c74d9f18b0df9da))
* **proto:** prevent false pagination detection for recursive types ([f41b510](https://github.com/TaeGyumKim/mock-fried/commit/f41b510bfa552a4fa2a595aff5b6332acb4474c0))
* resolve TypeScript type errors in CI ([7e150ec](https://github.com/TaeGyumKim/mock-fried/commit/7e150ec9d0d4a7571e33077e22615b16e663f497))
