# Mock-Fried

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt 3 Mock API Module - OpenAPI & Protobuf RPC Mock Server

## Features

- **OpenAPI Mock Server** - OpenAPI 스펙 기반 자동 Mock 응답 생성
- **Protobuf RPC Mock** - Proto 파일 기반 gRPC-style RPC Mock
- **API Explorer** - Swagger UI 스타일의 인터랙티브 API 테스트 UI
- **Type-Safe Client** - `$api` 클라이언트로 타입 안전한 API 호출
- **Zero Config** - 스펙 파일만 있으면 즉시 사용 가능

## Quick Setup

```bash
# npm
npm install mock-fried

# yarn
yarn add mock-fried

# pnpm
pnpm add mock-fried
```

`nuxt.config.ts`에 모듈 추가:

```typescript
export default defineNuxtConfig({
  modules: ['mock-fried'],

  mock: {
    enable: true,
    prefix: '/mock',
    openapi: './mocks/openapi.yaml',  // OpenAPI 스펙 경로
    proto: './mocks/example.proto',    // Proto 파일 경로
  },
})
```

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enable` | `boolean` | `true` | Mock 기능 활성화 |
| `prefix` | `string` | `'/mock'` | API 라우트 prefix |
| `openapi` | `string \| object` | - | OpenAPI 스펙 파일 경로 또는 클라이언트 패키지 설정 |
| `proto` | `string` | - | Proto 파일 경로 |

### OpenAPI 설정 옵션

**1. 스펙 파일 직접 사용:**

```typescript
mock: {
  // 상대 경로
  openapi: './mocks/openapi.yaml',

  // 절대 경로
  openapi: '/path/to/openapi.yaml',
}
```

**2. 생성된 클라이언트 패키지 사용 (권장):**

```typescript
mock: {
  // openapi-generator로 생성된 TypeScript 클라이언트 패키지
  openapi: {
    package: '@your-org/api-client',
    apisDir: 'src/apis',      // optional, default: 'src/apis'
    modelsDir: 'src/models',  // optional, default: 'src/models'
  },
}
```

생성된 클라이언트 패키지를 사용하면:

- 정확한 타입 기반 Mock 데이터 생성
- 실제 API 응답 구조와 일치하는 Mock 응답
- snake_case/camelCase JSON 키 변환 자동 처리

## Usage

### REST API (OpenAPI)

```typescript
const { $api } = useNuxtApp()

// GET 요청
const users = await $api.rest('/users')

// Path 파라미터
const user = await $api.rest('/users/1')

// Query 파라미터
const products = await $api.rest('/products', {
  params: { category: 'electronics', limit: 10 }
})

// POST 요청
const newUser = await $api.rest('/users', {
  method: 'POST',
  body: { name: 'John', email: 'john@example.com' }
})
```

### RPC (Protobuf)

```typescript
const { $api } = useNuxtApp()

// 명시적 RPC 호출
const user = await $api.rpc('UserService', 'GetUser', { id: 1 })

// 동적 서비스 접근
const user = await $api.UserService.GetUser({ id: 1 })
const products = await $api.ProductService.ListProducts({ page: 1, limit: 10 })
```

### API Schema 조회

```typescript
const { $api } = useNuxtApp()

// 전체 스키마 조회
const schema = await $api.getSchema()
// { openapi: {...}, rpc: {...} }
```

## API Explorer

모듈에 포함된 API Explorer 컴포넌트로 Swagger UI 스타일의 인터페이스 제공:

```vue
<template>
  <MockApiExplorer
    title="My API Explorer"
    description="Interactive API Testing"
  />
</template>
```

### 포함된 컴포넌트

| Component | Description |
|-----------|-------------|
| `<MockApiExplorer>` | 메인 API 탐색기 |
| `<MockEndpointCard>` | REST 엔드포인트 카드 |
| `<MockRpcMethodCard>` | RPC 메서드 카드 |
| `<MockResponseViewer>` | 응답 뷰어 모달 |

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mock/__schema` | GET | API 스키마 메타데이터 |
| `/mock/__reset` | POST | 캐시 초기화 |
| `/mock/rpc/:service/:method` | POST | RPC Mock 핸들러 |
| `/mock/**` | * | OpenAPI Mock 핸들러 |

## Development

```bash
# Install dependencies
yarn install

# Generate type stubs
yarn dev:prepare

# Develop with OpenAPI playground
yarn dev:openapi

# Develop with Proto playground
yarn dev:proto

# Run ESLint
yarn lint
yarn lint:fix

# Format with Prettier
yarn format

# Run tests
yarn test
yarn test:watch

# Type check
yarn test:types
```

## Project Structure

```
mock-fried/
├── src/
│   ├── module.ts              # 모듈 엔트리
│   ├── types.ts               # 타입 정의
│   └── runtime/
│       ├── plugin.ts          # $api 클라이언트 플러그인
│       ├── composables/       # useApi composable
│       ├── components/        # API Explorer 컴포넌트
│       └── server/
│           ├── handlers/      # Nitro 서버 핸들러
│           └── utils/         # Mock 데이터 생성 유틸
├── playground-openapi/        # OpenAPI 테스트 환경
└── playground-proto/          # Proto 테스트 환경
```

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/mock-fried/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/mock-fried

[npm-downloads-src]: https://img.shields.io/npm/dm/mock-fried.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/mock-fried

[license-src]: https://img.shields.io/npm/l/mock-fried.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/mock-fried

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt
[nuxt-href]: https://nuxt.com
